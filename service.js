import TrackPlayer, { Event } from 'react-native-track-player';

// هذي الخدمة تشتغل بالخلفية حتى لو التطبيق مو مفتوح،
// وتربط أزرار شاشة القفل/الإشعار بأوامر المشغّل الفعلية
export async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());

  // لو حصل انقطاع بالستريم (مشكلة شبكة مثلاً) نوقف التشغيل بدل ما يعلّق
  TrackPlayer.addEventListener(Event.PlaybackError, () => TrackPlayer.stop());
}
