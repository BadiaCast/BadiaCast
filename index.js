import { registerRootComponent } from 'expo';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer from 'react-native-track-player';

import App, { LANG_KEY } from './App';
import { PlaybackService } from './service';

// تسجيل المكوّن الرئيسي فورًا ومتزامن — هذا ضروري وما يحتمل أي تأخير.
// (تأخيره خلف عملية async كان يسبب كراش فوري عند فتح التطبيق بنسخة الإنتاج)
registerRootComponent(App);

// تسجيل خدمة التشغيل الخلفي — لازم تكون هنا بالضبط (نقطة الدخول)
TrackPlayer.registerPlaybackService(() => PlaybackService);

// نحفظ اتجاه RTL/LTR الصحيح على المستوى الأصلي بناءً على آخر لغة اختارها المستخدم.
// هذا ما يأثر على الجلسة الحالية إطلاقًا (الاتجاه يكون اتحدد فعليًا بالطبقة الأصلية
// قبل ما الكود يوصل هنا أصلاً) — بس يضمن صحة الإعداد لأول مرة يفتح فيها التطبيق
// وللإقلاعات الجاية، بدون ما نأخّر تسجيل التطبيق نفسه
AsyncStorage.getItem(LANG_KEY)
  .then((savedLang) => {
    const isArabic = savedLang !== 'en';
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(isArabic);
  })
  .catch(() => {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  });
