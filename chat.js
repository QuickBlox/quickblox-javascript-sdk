const QB = require('./src/qbMain.js');

QB.init(36125, 'gOGVNO4L9cBwkPE', 'JdqsMHCjHVYkVxV', { debug: { mode: 1 } });
        
QB.createSession({
    email: 'qq@qq.qq',
    password: 'qq@qq.qq'
}, (err, session) => {
    QB.chat.connect({
        userId: session.user_id,
        password: session.token
    });
    QB.chat.connect({
        userId: session.user_id,
        password: session.token
    });
});
