import { registerRootComponent } from 'expo';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer from 'react-native-track-player';

import App, { LANG_KEY } from './App';
import { PlaybackService } from './service';

// لازم نحدد اتجاه RTL/LTR بناءً على اللغة المحفوظة *قبل* ما نعرض أي واجهة —
// عشان أول رسمة بالشاشة تطلع بالاتجاه الصح من البداية بدون أي وميض أو قفزة
async function bootstrap() {
  try {
    const savedLang = await AsyncStorage.getItem(LANG_KEY);
    const isArabic = savedLang !== 'en'; // الافتراضي عربي لو ما فيه اختيار محفوظ
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(isArabic);
  } catch (e) {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  }

  // تسجيل المكوّن الرئيسي للتطبيق
  registerRootComponent(App);
}

bootstrap();

// تسجيل خدمة التشغيل الخلفي — لازم تكون هنا بالضبط (نقطة الدخول)
// مو داخل أي مكوّن، عشان أندرويد يقدر يشغّلها حتى لو التطبيق مقفول
TrackPlayer.registerPlaybackService(() => PlaybackService);
