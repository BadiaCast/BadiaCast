import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Linking, Animated, StyleSheet, SafeAreaView,
  StatusBar, Image, ImageBackground, I18nManager, TextInput, Modal,
  KeyboardAvoidingView, Platform, ActivityIndicator, AppState,
} from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import Svg, { Path, Circle, Line, Polygon } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

I18nManager.forceRTL(true);

// رابط البث المباشر الفعلي لبادية كاست (radio.co)
const STREAM_URL = 'https://streams.radio.co/s3dde1064a/listen';

// رابط استقبال بيانات التسجيل (Google Apps Script)
const REGISTER_URL = 'https://script.google.com/macros/s/AKfycbzoHhr7Z26WL-1IESyowB6NTEdZ2AT6_mq_VtdNrCdhodQ8PkTIhochXuKwG7T2hmUP/exec';
const STORAGE_KEY = 'badiacast_signup_done';

// ───────────────────────────── لوحة الألوان — بنفسجي ملكي فاخر ─────────────────────────────
const C = {
  bg:      '#14081F',
  bg2:     '#1C0E2B',
  card:    '#271438',
  card2:   '#2F1842',
  purple:  '#6B3FA0',
  purpleDim: 'rgba(107,63,160,0.20)',
  gold:    '#C9A84C',
  gold2:   '#E8C87A',
  goldDim: 'rgba(201,168,76,0.14)',
  live:    '#E84481',
  liveDim: 'rgba(232,68,129,0.20)',
  sand:    '#F5ECD7',
  muted:   '#A593BE',
  muted2:  '#C2B3DA',
  white:   '#FDFAF5',
  border:  'rgba(201,168,76,0.18)',
  borderPurple: 'rgba(168,130,214,0.25)',
};

const ICON_SIZE_TAB = 22;
const ICON_SIZE_PILLAR = 19;
const ICON_SIZE_SOCIAL = 19;

const STROKE = 1.8;
const Icon = {
  Home: ({ color, size = ICON_SIZE_TAB }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 11.5L12 4l9 7.5" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5.5 10v9a1 1 0 0 0 1 1H17.5a1 1 0 0 0 1-1v-9" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9.5 20v-5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V20" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Radio: ({ color, size = ICON_SIZE_TAB }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="14" r="7" stroke={color} strokeWidth={STROKE} />
      <Circle cx="12" cy="14" r="2" fill={color} />
      <Path d="M8 5.5L12 8l4-2.5" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M4.5 9.5a10 10 0 0 1 1.8-3" stroke={color} strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />
      <Path d="M19.5 9.5a10 10 0 0 0-1.8-3" stroke={color} strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />
    </Svg>
  ),
  Compass: ({ color, size = ICON_SIZE_TAB }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={STROKE} />
      <Polygon points="14.5,9.5 13,13 9.5,14.5 11,11" fill={color} stroke={color} strokeWidth={0.6} strokeLinejoin="round" />
    </Svg>
  ),
  Mail: ({ color, size = ICON_SIZE_TAB }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" stroke={color} strokeWidth={STROKE} strokeLinejoin="round" />
      <Path d="M3.5 7l8.5 6.5L20.5 7" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Clock: ({ color, size = ICON_SIZE_PILLAR }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={STROKE} />
      <Path d="M12 7v5.5l3.5 2" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Mic: ({ color, size = ICON_SIZE_PILLAR }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 14a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 0 0-7 0v4.5A3.5 3.5 0 0 0 12 14z" stroke={color} strokeWidth={STROKE} />
      <Path d="M6 11a6 6 0 0 0 12 0" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
      <Line x1="12" y1="17" x2="12" y2="21" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
      <Line x1="9" y1="21" x2="15" y2="21" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
    </Svg>
  ),
  Star: ({ color, size = ICON_SIZE_PILLAR }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polygon points="12,3 14.7,9.3 21.5,9.9 16.3,14.3 17.9,21 12,17.3 6.1,21 7.7,14.3 2.5,9.9 9.3,9.3"
        stroke={color} strokeWidth={STROKE} strokeLinejoin="round" />
    </Svg>
  ),
  Instagram: ({ color, size = ICON_SIZE_SOCIAL }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 2.5h10A4.5 4.5 0 0 1 21.5 7v10a4.5 4.5 0 0 1-4.5 4.5H7A4.5 4.5 0 0 1 2.5 17V7A4.5 4.5 0 0 1 7 2.5z" stroke={color} strokeWidth={STROKE} />
      <Circle cx="12" cy="12" r="4.2" stroke={color} strokeWidth={STROKE} />
      <Circle cx="17.2" cy="6.8" r="1.1" fill={color} />
    </Svg>
  ),
  X: ({ color, size = ICON_SIZE_SOCIAL }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 4l16 16M20 4L4 20" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
    </Svg>
  ),
  YouTube: ({ color, size = ICON_SIZE_SOCIAL }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12c0-3.5.3-5 1-5.8C5 5 8 4.8 12 4.8s7 .2 8 1.4c.7.8 1 2.3 1 5.8s-.3 5-1 5.8c-1 1.2-4 1.4-8 1.4s-7-.2-8-1.4C3.3 17 3 15.5 3 12z" stroke={color} strokeWidth={STROKE} strokeLinejoin="round" />
      <Polygon points="10,9 10,15 15.5,12" fill={color} />
    </Svg>
  ),
  Play: ({ color, size = 22 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polygon points="6,4 20,12 6,20" fill={color} />
    </Svg>
  ),
  Pause: ({ color, size = 22 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="7" y1="4" x2="7" y2="20" stroke={color} strokeWidth={3.4} strokeLinecap="round" />
      <Line x1="17" y1="4" x2="17" y2="20" stroke={color} strokeWidth={3.4} strokeLinecap="round" />
    </Svg>
  ),
  ArrowLeft: ({ color, size = 18 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M11 6l-6 6 6 6" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
};

function LiveDot({ size = 7 }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 0.25, duration: 850, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1,    duration: 850, useNativeDriver: true }),
    ])).start();
  }, []);
  return <Animated.View style={[styles.liveDot, { width: size, height: size, borderRadius: size / 2, opacity: pulse }]} />;
}

function Waveform({ active }) {
  const heights = [4,6,9,13,18,23,28,33,38,42,46,49,49,46,42,38,33,28,23,18,13,9,6,4];
  const anims = useRef(heights.map(() => new Animated.Value(0.12))).current;

  useEffect(() => {
    if (!active) {
      anims.forEach(a => Animated.timing(a, { toValue: 0.12, duration: 350, useNativeDriver: true }).start());
      return;
    }
    const loops = anims.map((a, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 45),
        Animated.timing(a, { toValue: 1,    duration: 480 + (i % 5) * 75, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0.12, duration: 480 + (i % 5) * 75, useNativeDriver: true }),
      ]))
    );
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, [active]);

  return (
    <View style={styles.waveform}>
      {heights.map((h, i) => (
        <Animated.View key={i} style={[styles.waveBar, { height: h, transform: [{ scaleY: anims[i] }] }]} />
      ))}
    </View>
  );
}

function SignupModal({ visible, onClose }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const finish = async () => {
    try { await AsyncStorage.setItem(STORAGE_KEY, 'true'); } catch (e) {}
    onClose();
  };

  const handleSkip = () => finish();

  const handleSubmit = async () => {
    setErrorMsg('');
    const emailTrim = email.trim();
    const phoneTrim = phone.trim();

    if (!emailTrim && !phoneTrim) {
      setErrorMsg('عبّي البريد أو رقم الجوال، أو اضغط تخطي');
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim);
    if (emailTrim && !emailOk) {
      setErrorMsg('تأكد من صيغة البريد الإلكتروني');
      return;
    }

    setSending(true);
    try {
      await fetch(REGISTER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTrim, phone: phoneTrim }),
      });
    } catch (e) {
      // حتى لو فشل الاتصال، نكمل تجربة المستخدم بدون إزعاج
    }
    setSending(false);
    finish();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalCard}>
          <View style={styles.modalRing}>
            <Image source={require('./assets/logo.png')} style={styles.modalLogo} resizeMode="contain" />
          </View>

          <Text style={styles.modalTitle}>انضم لعائلة بادية كاست</Text>
          <Text style={styles.modalDesc}>
            سجّل بريدك أو جوالك عشان توصلك آخر الأخبار والبرامج الجديدة
          </Text>

          <TextInput
            style={styles.modalInput}
            placeholder="البريد الإلكتروني"
            placeholderTextColor={C.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            textAlign="right"
          />
          <TextInput
            style={styles.modalInput}
            placeholder="رقم الجوال"
            placeholderTextColor={C.muted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            textAlign="right"
          />

          {!!errorMsg && <Text style={styles.modalError}>{errorMsg}</Text>}

          <TouchableOpacity
            style={styles.modalSubmitBtn}
            onPress={handleSubmit}
            disabled={sending}
            activeOpacity={0.85}
          >
            {sending
              ? <ActivityIndicator color={C.bg} />
              : <Text style={styles.modalSubmitTxt}>تسجيل</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSkip} activeOpacity={0.6} style={styles.modalSkipBtn}>
            <Text style={styles.modalSkipTxt}>تخطّي</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ───────────────────────────── التطبيق ─────────────────────────────
export default function App() {
  const [tab, setTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const open = (url) => Linking.openURL(url).catch(() => {});

  // مشغّل صوت احترافي (expo-audio) — يدعم البث الحقيقي بالخلفية عبر Foreground Service
  const player = useAudioPlayer(STREAM_URL);
  const status = useAudioPlayerStatus(player);
  const playing = status?.playing ?? false;

  // إعداد وضع الصوت ليستمر بالخلفية حتى لو المستخدم خرج من التطبيق أو قفل الشاشة
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
      interruptionModeAndroid: 'doNotMix',
      shouldRouteThroughEarpiece: false,
    });
  }, []);

  // يفحص إذا المستخدم سجّل أو تخطّى سابقاً، ويعرض النموذج مرة وحدة بس
  useEffect(() => {
    (async () => {
      try {
        const done = await AsyncStorage.getItem(STORAGE_KEY);
        if (!done) setShowSignup(true);
      } catch (e) {
        setShowSignup(true);
      }
    })();
  }, []);

  const togglePlay = async () => {
    try {
      if (playing) {
        player.pause();
        return;
      }
      setLoading(true);
      player.play();
      setLoading(false);
    } catch (e) {
      setLoading(false);
      alert('تعذّر تشغيل البث، تأكد من اتصال الإنترنت وحاول مرة أخرى');
    }
  };

  const TABS = [
    { key: 'home',    label: 'الرئيسية', Icon: Icon.Home },
    { key: 'player',  label: 'البث',     Icon: Icon.Radio },
    { key: 'about',   label: 'من نحن',   Icon: Icon.Compass },
    { key: 'contact', label: 'تواصل',    Icon: Icon.Mail },
  ];

  // ── الرئيسية ──
  const HomeScreen = () => (
    <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
      <ImageBackground
        source={require('./assets/desert.jpg')}
        style={styles.hero}
        imageStyle={styles.heroBgImage}
      >
        <View style={styles.heroOverlay} />
        <Text style={styles.eyebrow}>BADIACAST · DIGITAL RADIO</Text>

        <Image source={require('./assets/logo.png')} style={styles.heroLogo} resizeMode="contain" />

        <Text style={styles.slogan}>صوت البادية … ٢٤ ساعة</Text>
        <View style={styles.divider} />
        <Text style={styles.desc}>
          منصة إعلامية رقمية تحتفي بالتراث العربي والبدوي والخليجي،{'\n'}
          عبر الموسيقى التراثية والشعر والقصص والبرامج الثقافية
        </Text>

        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.btnGold} onPress={() => setTab('player')} activeOpacity={0.85}>
            <Text style={styles.btnGoldTxt}>استمع الآن</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnGhost} onPress={() => setTab('about')} activeOpacity={0.7}>
            <Text style={styles.btnGhostTxt}>اعرف أكثر</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.liveBadge}><LiveDot /><Text style={styles.liveTxt}>مباشر</Text></View>
          <Text style={styles.cardTitle}>بادية كاست — البث المباشر</Text>
        </View>
        <TouchableOpacity style={styles.playMini} onPress={() => setTab('player')} activeOpacity={0.85}>
          <Icon.Play color={C.gold} size={16} />
          <Text style={styles.playMiniTxt}>افتح المشغّل</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ── المشغّل ──
  const PlayerScreen = () => (
    <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.playerCard}>
        <View style={styles.ringWrap}>
          <View style={styles.ring}>
            <Image source={require('./assets/logo.png')} style={styles.ringLogo} resizeMode="contain" />
          </View>
          <View style={styles.ringLive}><LiveDot size={6} /><Text style={styles.ringLiveTxt}>مباشر</Text></View>
        </View>

        <Text style={styles.nowPlaying}>يُبث الآن</Text>
        <Text style={styles.stTitle}>بادية كاست</Text>
        <Text style={styles.stSub}>صوت البادية · بث مستمر ٢٤ ساعة</Text>

        <Waveform active={playing} />

        <TouchableOpacity
          style={[styles.playBtn, playing && styles.playBtnOn]}
          onPress={togglePlay}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <Text style={styles.playBtnTxt}>جاري التحميل…</Text>
          ) : (
            <>
              {playing ? <Icon.Pause color={C.bg} size={20} /> : <Icon.Play color={C.bg} size={20} />}
              <Text style={styles.playBtnTxt}>{playing ? 'إيقاف' : 'تشغيل البث'}</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.streamNote}>
          {playing ? '🔴 يبث الآن مباشرة — يستمر حتى لو خرجت من التطبيق' : 'اضغط للاستماع للبث المباشر'}
        </Text>
      </View>
    </ScrollView>
  );

  // ── من نحن ──
  const AboutScreen = () => (
    <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
      <Text style={styles.secLabel}>من نحن · ABOUT US</Text>
      <Text style={styles.secTitle}>صوت يحمل روح البادية إلى العالم</Text>

      <Text style={styles.body}>
        بادية كاست منصة إعلامية رقمية مكرّسة لحفظ تراث البادية السعودي والخليجي والعربي
        وتعزيزه عبر تقنيات البث الحديثة
      </Text>
      <Text style={styles.body}>
        تقدّم المنصة محتوى ثقافيا وترفيهياً أصيلاً، محافظةً على الهوية
      والموروث
      </Text>

      <View style={styles.statsRow}>
        {[['٢٤', 'ساعة بث'], ['١٠٠٪', 'محتوى أصيل']].map(([n, l], i) => (
          <View key={i} style={[styles.statBox, i === 0 && styles.statBorder]}>
            <Text style={styles.statNum}>{n}</Text>
            <Text style={styles.statLbl}>{l}</Text>
          </View>
        ))}
      </View>

      {[
        { I: Icon.Clock, title: 'بث مستمر — ٢٤/٧', text: 'محتوى لا ينقطع على مدار الساعة طوال أيام الأسبوع' },
        { I: Icon.Mic,   title: 'رسالتنا',          text: 'الحفاظ على التراث العربي والترويج له عبر الإعلام الرقمي' },
        { I: Icon.Star,  title: 'رؤيتنا',            text: 'أن نكون الوجهة الرقمية الرائدة للبث الثقافي البدوي والعربي' },
      ].map(({ I, title, text }, i) => (
        <View key={i} style={styles.pillar}>
          <View style={styles.pillarIcon}><I color={C.gold} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pillarTitle}>{title}</Text>
            <Text style={styles.pillarText}>{text}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  // ── تواصل ──
  const ContactScreen = () => (
    <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
      <Text style={styles.secLabel}>تواصل معنا · CONTACT</Text>
      <Text style={styles.secTitle}>نسعد بالتواصل معكم</Text>
      <Text style={styles.body}>للاستفسارات والمقترحات والشراكات الإعلامية</Text>

      <TouchableOpacity style={styles.contactItem} onPress={() => open('mailto:info@badiacast.com')} activeOpacity={0.8}>
        <View style={styles.contactIconBox}><Icon.Mail color={C.gold} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cLabel}>البريد الإلكتروني</Text>
          <Text style={styles.cValue}>info@badiacast.com</Text>
        </View>
      </TouchableOpacity>

      <Text style={[styles.secLabel, { marginTop: 30 }]}>منصات التواصل</Text>
      {[
        { I: Icon.Instagram, label: 'Instagram',  url: 'https://www.instagram.com/badiacastt' },
        { I: Icon.X,         label: 'X',        url: 'https://x.com/badiacast' },
        { I: Icon.YouTube,   label: 'Youtube',     url: 'https://youtube.com/@BadiaCast' },
      ].map(({ I, label, url }, i) => (
        <TouchableOpacity key={i} style={styles.socialBtn} onPress={() => open(url)} activeOpacity={0.8}>
          <View style={styles.contactIconBox}><I color={C.gold} /></View>
          <Text style={styles.cValue}>{label}</Text>
          <Icon.ArrowLeft color={C.muted} />
        </TouchableOpacity>
      ))}

      <View style={styles.footerLogo}>
        <Image source={require('./assets/logo.png')} style={styles.footerLogoImg} resizeMode="contain" />
      </View>
      <Text style={styles.footer}>© ٢٠٢٦ بادية كاست — جميع الحقوق محفوظة</Text>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={styles.header}>
        <Image source={require('./assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>بادية كاست</Text>
          <Text style={styles.headerSub}>BADIACAST</Text>
        </View>
        <View style={styles.headerLive}><LiveDot size={6} /><Text style={styles.headerLiveTxt}>مباشر</Text></View>
      </View>

      {tab === 'home'    && <HomeScreen />}
      {tab === 'player'  && <PlayerScreen />}
      {tab === 'about'   && <AboutScreen />}
      {tab === 'contact' && <ContactScreen />}

      <View style={styles.tabBar}>
        {TABS.map(({ key, label, Icon: TIcon }) => {
          const active = tab === key;
          return (
            <TouchableOpacity key={key} style={styles.tabItem} onPress={() => setTab(key)} activeOpacity={0.7}>
              {active && <View style={styles.tabIndicator} />}
              <TIcon color={active ? C.gold : C.white} />
              <Text style={[styles.tabLbl, active && styles.tabLblActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <SignupModal visible={showSignup} onClose={() => setShowSignup(false)} />
    </SafeAreaView>
  );
}

// ───────────────────────────── الأنماط ─────────────────────────────
const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  screen: { padding: 20, paddingBottom: 44 },

  header:        { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg2,
                   borderBottomWidth: 1, borderBottomColor: C.borderPurple,
                   paddingHorizontal: 18, paddingVertical: 12, gap: 12 },
  headerLogo:    { width: 95, height: 50 },
  headerText:    { flex: 1 },
  headerTitle:   { fontSize: 17, color: C.white, fontWeight: '700', textAlign: 'right' },
  headerSub:     { fontSize: 9, color: C.white, letterSpacing: 1, marginTop: 1, textAlign: 'right' },
  headerLive:    { flexDirection: 'row', alignItems: 'center', gap: 5,
                   backgroundColor: C.liveDim, borderWidth: 1, borderColor: 'rgba(232,68,129,0.5)',
                   borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  headerLiveTxt: { color: C.gold2, fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },

  tabBar:        { flexDirection: 'row', backgroundColor: C.bg2,
                   borderTopWidth: 1, borderTopColor: C.borderPurple, paddingBottom: 10, paddingTop: 10 },
  tabItem:       { flex: 1, alignItems: 'center', gap: 5, paddingVertical: 4 },
  tabIndicator:  { position: 'absolute', top: -10, width: 28, height: 2.5, borderRadius: 2, backgroundColor: C.gold },
  tabLbl:        { fontSize: 10.5, color: C.muted, fontWeight: '500' },
  tabLblActive:  { color: C.gold, fontWeight: '700' },

  hero:        { borderRadius: 18, paddingVertical: 40, paddingHorizontal: 24,
                 borderWidth: 1, borderColor: C.borderPurple, alignItems: 'center', marginBottom: 16,
                 overflow: 'hidden' },
  heroBgImage: { borderRadius: 17 },
  heroOverlay: { ...StyleSheet.absoluteFillObject,
                 backgroundColor: 'rgba(20,8,31,0.78)' },
  eyebrow:     { fontSize: 9, color: C.gold, letterSpacing: 4, marginBottom: 22, fontWeight: '600' },
  heroLogo:    { width: 200, height: 150, marginBottom: 8 },
  slogan:      { fontSize: 17, color: C.gold, marginTop: 6, textAlign: 'center', fontWeight: '600' },
  divider:     { width: 50, height: 1.5, backgroundColor: C.gold, opacity: 0.45, marginVertical: 18, borderRadius: 1 },
  desc:        { fontSize: 10.5, color: C.gold, textAlign: 'center', lineHeight: 23 },
  ctaRow:      { flexDirection: 'row', gap: 12, marginTop: 26 },
  btnGold:     { backgroundColor: C.gold, paddingHorizontal: 26, paddingVertical: 13, borderRadius: 10,
                 shadowColor: C.gold, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  btnGoldTxt:  { color: C.bg, fontWeight: '700', fontSize: 14.5 },
  btnGhost:    { borderWidth: 1, borderColor: C.borderPurple, paddingHorizontal: 26, paddingVertical: 13, borderRadius: 10 },
  btnGhostTxt: { color: C.sand, fontSize: 14.5, fontWeight: '500' },

  card:        { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.borderPurple, padding: 18 },
  row:         { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  liveBadge:   { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.liveDim,
                 borderWidth: 1, borderColor: 'rgba(232,68,129,0.4)', borderRadius: 20,
                 paddingHorizontal: 10, paddingVertical: 5 },
  liveTxt:     { color: C.live, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  cardTitle:   { color: C.white, fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'right' },
  playMini:    { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
                 backgroundColor: C.goldDim, borderWidth: 1, borderColor: C.border,
                 borderRadius: 10, paddingVertical: 13 },
  playMiniTxt: { color: C.gold, fontSize: 14, fontWeight: '700' },

  playerCard:  { backgroundColor: C.card, borderRadius: 18, paddingVertical: 38, paddingHorizontal: 28,
                 borderWidth: 1, borderColor: C.borderPurple, alignItems: 'center' },
  ringWrap:    { alignItems: 'center', marginBottom: 26 },
  ring:        { width: 156, height: 156, borderRadius: 78, backgroundColor: '#0E0518',
                 borderWidth: 2, borderColor: C.gold, alignItems: 'center', justifyContent: 'center',
                 padding: 18, shadowColor: C.gold, shadowOpacity: 0.35, shadowRadius: 22, shadowOffset: { width: 0, height: 0 } },
  ringLogo:    { width: '300%', height: '100%' },
  ringLive:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#190B26',
                 borderWidth: 1, borderColor: 'rgba(232,68,129,0.45)', borderRadius: 20,
                 paddingHorizontal: 14, paddingVertical: 5, marginTop: -13 },
  ringLiveTxt: { color: C.live, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  nowPlaying:  { fontSize: 15.5, color: C.gold, letterSpacing: 4, marginBottom: 9, fontWeight: '600' },
  stTitle:     { fontSize: 22, color: C.white, fontWeight: '700', textAlign: 'center', marginBottom: 5 },
  stSub:       { fontSize: 12.5, color: C.white, marginBottom: 26 },
  waveform:    { flexDirection: 'row', alignItems: 'center', gap: 3, height: 52, marginBottom: 30 },
  waveBar:     { width: 3, borderRadius: 3, backgroundColor: C.gold },
  playBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                 backgroundColor: C.gold, borderRadius: 14, paddingVertical: 17, paddingHorizontal: 44,
                 marginBottom: 18, minWidth: 200,
                 shadowColor: C.gold, shadowOpacity: 0.3, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
  playBtnOn:   { backgroundColor: C.purple, shadowColor: C.purple },
  playBtnTxt:  { color: C.bg, fontWeight: '700', fontSize: 15.5 },
  streamNote:  { color: C.gold, fontSize: 12.5, textAlign: 'center', paddingHorizontal: 12, lineHeight: 19 },

  secLabel:    { fontSize: 10.5, color: C.gold, letterSpacing: 4, marginBottom: 11, fontWeight: '600' },
  secTitle:    { fontSize: 23, color: C.white, fontWeight: '700', marginBottom: 18, lineHeight: 33 },
  body:        { fontSize: 12.5, color: C.white, lineHeight: 23, marginBottom: 12 },

  statsRow:    { flexDirection: 'row', borderWidth: 1, borderColor: C.borderPurple,
                 borderRadius: 12, overflow: 'hidden', marginVertical: 24 },
  statBox:     { flex: 1, backgroundColor: C.card, paddingVertical: 22, alignItems: 'center' },
  statBorder:  { borderRightWidth: 1, borderRightColor: C.borderPurple },
  statNum:     { fontSize: 26, color: C.gold, fontWeight: '700' },
  statLbl:     { fontSize: 11.5, color: C.white, marginTop: 5 },

  pillar:      { flexDirection: 'row', gap: 14, marginBottom: 20, alignItems: 'flex-start' },
  pillarIcon:  { width: 42, height: 42, borderRadius: 10, borderWidth: 1, borderColor: C.borderPurple,
                 backgroundColor: C.purpleDim, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  pillarTitle: { color: C.gold, fontSize: 14.5, fontWeight: '700', marginBottom: 4 },
  pillarText:  { color: C.white, fontSize: 12.5, lineHeight: 19 },

  contactItem:    { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.card,
                    borderWidth: 1, borderColor: C.borderPurple, borderRadius: 12, padding: 16, marginBottom: 12 },
  contactIconBox: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, borderColor: C.borderPurple,
                    backgroundColor: C.purpleDim, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cLabel:      { fontSize: 9.5, color: C.muted, letterSpacing: 1.5, marginBottom: 3 },
  cValue:      { color: C.white, fontSize: 13.5, flex: 1, fontWeight: '500' },
  socialBtn:   { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.card,
                 borderWidth: 1, borderColor: C.borderPurple, borderRadius: 12, padding: 14, marginBottom: 10 },

  footerLogo:    { alignItems: 'center', marginTop: 38, opacity: 0.9 },
  footerLogoImg: { width: 64, height: 64 },
  footer:        { color: C.muted, fontSize: 10.5, textAlign: 'center', marginTop: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(10,4,16,0.90)',
                  alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard:    { width: '100%', maxWidth: 380, backgroundColor: C.card,
                  borderRadius: 20, borderWidth: 1, borderColor: C.borderPurple,
                  paddingVertical: 30, paddingHorizontal: 24, alignItems: 'center',
                  shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 30, shadowOffset: { width: 0, height: 10 } },
  modalRing:    { width: 84, height: 84, borderRadius: 42, backgroundColor: '#0E0518',
                  borderWidth: 2, borderColor: C.gold, alignItems: 'center', justifyContent: 'center',
                  padding: 12, marginBottom: 18 },
  modalLogo:    { width: '100%', height: '100%' },
  modalTitle:   { fontSize: 19, color: C.white, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  modalDesc:    { fontSize: 13, color: C.muted2, textAlign: 'center', lineHeight: 20, marginBottom: 22 },
  modalInput:   { width: '100%', backgroundColor: C.bg, borderWidth: 1, borderColor: C.borderPurple,
                  borderRadius: 10, paddingHorizontal: 16, paddingVertical: 13, color: C.white,
                  fontSize: 14, marginBottom: 12 },
  modalError:   { color: '#F0A8C5', fontSize: 12, textAlign: 'center', marginBottom: 8 },
  modalSubmitBtn: { width: '100%', backgroundColor: C.gold, borderRadius: 12, paddingVertical: 15,
                    alignItems: 'center', justifyContent: 'center', marginTop: 6, minHeight: 50 },
  modalSubmitTxt: { color: C.bg, fontWeight: '700', fontSize: 15 },
  modalSkipBtn: { marginTop: 16, padding: 6 },
  modalSkipTxt: { color: C.muted, fontSize: 13, textDecorationLine: 'underline' },

  liveDot: { backgroundColor: C.live },
});
