/* 
 * QuickBlox JavaScript SDK / WebRTC Videochat plugin
 *
 * Configuration module
 *
 */

var config = {
	iceServers: [
		{urls: "stun:stun.l.google.com:19302"},
		{urls: "turn:turnserver.quickblox.com:3478?transport=udp", username: "", credential: ""},
		{urls: "turn:turnserver.quickblox.com:3478?transport=tcp", username: "", credential: ""}
	]
};

// Other public ICE Servers
/*
		'stun:stun01.sipphone.com',
		'stun:stun.ekiga.net',
		'stun:stun.fwdnet.net',
		'stun:stun.ideasip.com',
		'stun:stun.iptel.org',
		'stun:stun.rixtelecom.se',
		'stun:stun.schlund.de',
		'stun:stun.l.google.com:19302',
		'stun:stun1.l.google.com:19302',
		'stun:stun2.l.google.com:19302',
		'stun:stun3.l.google.com:19302',
		'stun:stun4.l.google.com:19302',
		'stun:stunserver.org',
		'stun:stun.softjoys.com',
		'stun:stun.voiparound.com',
		'stun:stun.voipbuster.com',
		'stun:stun.voipstunt.com',
		'stun:stun.voxgratia.org',
		'stun:stun.xten.com',
{
    url: 'turn:numb.viagenie.ca',
    credential: 'muazkh',
    username: 'webrtc@live.com'
},
{
    url: 'turn:192.158.29.39:3478?transport=udp',
    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
    username: '28224511:1379330808'
},
{
    url: 'turn:192.158.29.39:3478?transport=tcp',
    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
    username: '28224511:1379330808'
}*/

module.exports = config;
