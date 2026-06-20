import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';

import App from './App';
import { PlaybackService } from './service';

// تسجيل المكوّن الرئيسي للتطبيق
registerRootComponent(App);

// تسجيل خدمة التشغيل الخلفي — لازم تكون هنا بالضبط (نقطة الدخول)
// مو داخل أي مكوّن، عشان أندرويد يقدر يشغّلها حتى لو التطبيق مقفول
TrackPlayer.registerPlaybackService(() => PlaybackService);
