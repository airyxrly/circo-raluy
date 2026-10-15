// Nube con Firebase: inicio de sesión con Google, partida sincronizada y
// emparejamiento online. Solo se activa si js/firebase-config.js tiene datos.
(function (AA) {
  const cfg = window.FIREBASE_CONFIG;
  const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const C = AA.cloud = { enabled: !!cfg, ready: false, user: null };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('No se pudo cargar ' + src));
      document.head.appendChild(s);
    });
  }

  C.init = async function () {
    if (!cfg) return;
    try {
      await loadScript(SDK + 'firebase-app-compat.js');
      await Promise.all(['auth', 'firestore', 'database'].map(m => loadScript(SDK + `firebase-${m}-compat.js`)));
      firebase.initializeApp(cfg);
      C.ready = true;
      firebase.auth().onAuthStateChanged(async user => {
        C.user = user;
        if (user) {
          try { await C.pull(); } catch (e) { console.error(e); AA.toast('No se pudo leer tu partida de la nube'); }
        }
        AA.emit('change');
      });
    } catch (e) {
      console.error(e);
      AA.toast('No se pudo conectar con la nube');
    }
    AA.emit('change');
  };

  C.login = async function () {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await firebase.auth().signInWithPopup(provider);
    } catch (e) {
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') {
        await firebase.auth().signInWithRedirect(provider);
      } else if (e.code !== 'auth/popup-closed-by-user') {
        console.error(e);
        AA.toast('No se pudo iniciar sesión');
      }
    }
  };

  // Cierre de sesión seguro: sube la partida antes y, si se pide, borra la copia local.
  C.logout = async function (wipeLocal) {
    try { await C.push(); } catch (e) { console.warn(e); }
    await firebase.auth().signOut();
    C.user = null;
    if (wipeLocal) {
      AA.state = AA.newState();
      AA.saveQuiet();
    }
    AA.emit('change');
  };

  const playerDoc = () => firebase.firestore().collection('players').doc(C.user.uid);

  C.push = async function () {
    if (!C.user) return;
    clearTimeout(C._t);
    const S = AA.state;
    S.ownerUid = C.user.uid;
    AA.saveQuiet();
    await playerDoc().set({ save: JSON.stringify(S), updatedAt: S.updatedAt, name: S.name, level: S.level });
  };

  C.deleteData = async function () {
    if (!C.user) return;
    clearTimeout(C._t);
    await playerDoc().delete();
  };

  C.schedulePush = function () {
    if (!C.user) return;
    clearTimeout(C._t);
    C._t = setTimeout(() => C.push().catch(e => console.warn(e)), 4000);
  };

  // Al entrar: se queda la partida más reciente de esta cuenta.
  C.pull = async function () {
    const snap = await playerDoc().get();
    const S = AA.state, uid = C.user.uid;
    if (snap.exists) {
      const remote = snap.data();
      if (S.ownerUid !== uid || (remote.updatedAt || 0) > (S.updatedAt || 0)) {
        AA.state = AA.migrate(JSON.parse(remote.save));
        AA.state.onboarded = true;
        AA.saveQuiet();
        AA.toast('☁️ Partida recuperada de tu cuenta');
      } else {
        await C.push();
      }
    } else {
      if (S.ownerUid && S.ownerUid !== uid) AA.state = AA.newState();
      AA.state.ownerUid = uid;
      AA.save();
      await C.push();
      AA.toast('☁️ Partida vinculada a tu cuenta de Google');
    }
  };

  // ---------- Emparejamiento y combates online ----------
  const db = () => firebase.database();

  C.findMatch = async function (me) {
    await db().ref('lobbyResults/' + me.uid).remove();
    let taken = null;
    const res = await db().ref('lobby').transaction(cur => {
      taken = null;
      if (cur && cur.uid !== me.uid && Date.now() - cur.ts < 120000) {
        taken = cur;
        return null;
      }
      return Object.assign({}, me, { ts: Date.now() });
    });
    if (!res.committed) throw new Error('lobby');

    if (taken) {
      const ref = db().ref('matches').push();
      const s1 = AA.dragonStats(taken.dragon.species, taken.dragon.level);
      const s2 = AA.dragonStats(me.dragon.species, me.dragon.level);
      const strip = p => ({ uid: p.uid, name: p.name, rating: p.rating, dragon: p.dragon });
      await ref.set({
        p1: strip(taken), p2: strip(me),
        hp: { p1: s1.hp, p2: s2.hp },
        turn: s1.spd >= s2.spd ? 'p1' : 'p2',
        log: ['¡Comienza el duelo online!'],
        created: Date.now(), updated: Date.now(),
      });
      await db().ref('lobbyResults/' + taken.uid).set(ref.key);
      return ref.key;
    }

    return new Promise((resolve, reject) => {
      const r = db().ref('lobbyResults/' + me.uid);
      const cb = r.on('value', snap => {
        const v = snap.val();
        if (!v) return;
        r.off('value', cb);
        r.remove();
        C._cancel = null;
        resolve(v);
      });
      C._cancel = () => {
        r.off('value', cb);
        db().ref('lobby').transaction(cur => (cur && cur.uid === me.uid ? null : cur));
        reject(new Error('cancel'));
      };
    });
  };

  C.cancelSearch = function () {
    if (C._cancel) { C._cancel(); C._cancel = null; }
  };

  // Escucha el combate y marca presencia; devuelve la función para dejar de escuchar.
  C.watchMatch = function (id, onChange) {
    const ref = db().ref('matches/' + id);
    let presence = null;
    const cb = ref.on('value', snap => {
      const m = snap.val();
      if (m && !presence) {
        const side = m.p1.uid === C.user.uid ? 'p1' : 'p2';
        presence = ref.child('presence/' + side);
        presence.set(true);
        presence.onDisconnect().set(false);
      }
      onChange(m);
    });
    return () => {
      ref.off('value', cb);
      if (presence) { presence.onDisconnect().cancel(); presence.set(false); }
    };
  };

  // Prototipo: el cliente calcula el resultado. En producción, una Cloud
  // Function debería validar cada movimiento (ver DISENO.md, seguridad).
  C.matchMove = function (id, side, ab) {
    const other = side === 'p1' ? 'p2' : 'p1';
    return db().ref('matches/' + id).transaction(m => {
      if (!m || m.winner || m.turn !== side) return;
      const mk = p => {
        const f = AA.makeFighter(m[p].dragon);
        f.hp = m.hp[p];
        f.cds = Object.assign({}, m.cds && m.cds[p]);
        return f;
      };
      const me = mk(side), foe = mk(other);
      const move = me.abil.find(a => a.id === ab.id);
      if (!move || me.cds[move.id] > 0) return;
      const res = AA.resolveMove(me, foe, move);
      m.hp[side] = me.hp;
      m.hp[other] = foe.hp;
      m.cds = m.cds || {};
      m.cds[side] = me.cds;
      m.log = (m.log || []).slice(-5).concat(res.text);
      m.last = { by: side, dmg: res.dmg, heal: res.heal, crit: res.crit, at: Date.now() };
      m.turn = other;
      m.updated = Date.now();
      if (foe.hp <= 0) { m.winner = side; m.reason = 'ko'; }
      return m;
    });
  };

  // Termina el combate. requireTurn: solo vale si es el turno de ese jugador (rival inactivo).
  C.matchEnd = function (id, winner, reason, requireTurn) {
    return db().ref('matches/' + id).transaction(m => {
      if (!m || m.winner) return;
      if (requireTurn) {
        const away = m.presence && m.presence[requireTurn] === false;
        if (m.turn !== requireTurn || (!away && Date.now() - m.updated < 60000)) return;
      }
      m.winner = winner;
      m.reason = reason;
      m.updated = Date.now();
      return m;
    });
  };
})(window.AA);
