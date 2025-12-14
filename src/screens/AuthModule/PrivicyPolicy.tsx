import React from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, ScrollView, I18nManager, Platform, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import Header from '../../components/common/Header';
import ArrowRightIcon from '../../assets/icons/RightArrow';
import { useNavigation } from '@react-navigation/native';
import { globalTextStyles, CAIRO_FONT_FAMILY } from '../../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';

const termsHtmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    /* Import Cairo font from system */
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap');
    
    /* Fallback font definitions */
    @font-face {
      font-family: 'Cairo';
      src: local('Cairo');
      font-weight: normal;
      font-style: normal;
    }
    
    @font-face {
      font-family: 'Cairo';
      src: local('Cairo Bold');
      font-weight: bold;
      font-style: normal;
    }
    
    /* Force Cairo font on all elements with multiple selectors */
    html, body, div, h1, h2, h3, h4, h5, h6, p, span, a, li, ul, ol, strong, b, em, i, table, tr, td, th, article, main, section {
      font-family: 'Cairo', 'Arial', 'Helvetica', sans-serif !important;
    }
    
    /* Additional specific selectors */
    .ruls-article, .ruls-article *, .inside-main-page, .inside-main-page *, .container, .container * {
      font-family: 'Cairo', 'Arial', 'Helvetica', sans-serif !important;
    }
    
    body {
      direction: rtl;
      text-align: right;
      background-color: #fff;
      margin: 0;
      padding: 16px;
      box-sizing: border-box;
      width: 100%;
      overflow-x: hidden;
    }
    
    .inside-main-page {
      align-items: start;
      width: 100%;
    }
    
    .container {
      width: 100%;
      overflow-x: hidden;
    }
    
    .inside-main-page__container {
      width: 100%;
      overflow-x: hidden;
    }
    
    .ruls-article .green-text {
      color: #23a2a4
    }

    .ruls-article div {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      background-color: #f7fafa;
      border-radius: 20px;
      padding: 16px;
      box-sizing: border-box;
      overflow-wrap: break-word;
      word-wrap: break-word;
      hyphens: auto;
    }

    @media screen and (max-width: 767px) {
      .ruls-article div {
        background-color: #fff;
        padding: 0;
      }
    }

    .ruls-article h1 {
      font-weight: bold;
      font-size: 1.8rem;
      padding: 0px 0px 20px 0px;
      text-align: center;
      line-height: 44px;
      width: 100%;
      overflow-wrap: break-word;
      word-wrap: break-word;
    }

    .ruls-article article {
      padding: 15px 0px 25px 0px;
      margin: 10px 0px;
      border-bottom: 1px solid rgba(0,0,0,.1);
    }

    .ruls-article article h2 {
      font-weight: bold;
      font-size: 1.4rem;
      color: #23a2a4;
      padding: 8px 0px;
    }

    .ruls-article article p {
      font-size: 1rem;
      line-height: 34px;
      font-weight: normal;
      color: #666;
      text-align: right;
      width: 100%;
      overflow-wrap: break-word;
      word-wrap: break-word;
    }

    .ruls-article article ul li {
      padding: 8px;
      line-height: 34px;
      list-style: decimal;
    }

    .ruls-article article b {
      color: #555;
      font-weight: bold;
    }
  </style>
</head>
<body>
<main class="inside-main-page">
    <div class="container">
        <div class="inside-main-page__container ruls-article">
            <div>
                <h1>
                    هذه الشروط والأحكام "شروط وأحكام" تحكم العلاقة بينك وبين شركة نرعاكم
                </h1>
                <article>
                    <h2>الرجاء قراءة الشروط والأحكام بعناية قبل البدء بالاستخدام</h2>
                    <p>
                        إن وصولك إلى الخدمة واستخدامها مشروط بقبولك لهذه الشروط و الإلتزام بها. تنطبق هذه الشروط على جميع الزوار والمستخدمين وغيرهم ممن يدخلون إلى الخدمة أو يستخدمونها. بدخولك إلى الخدمة أو استخدامها ، فإنك تعلن موافقتك التامة على الإلتزام بهذه الشروط. إذا كنت لا توافق على أي جزء من الشروط ، فإنه لايحق لك الوصول إلى الخدمة
                    </p>
                </article>

                <article>
                    <h2>
                        الشراء / المشتريات
                    </h2>
                    <p>
                        إذا كنت ترغب في شراء خدمة يتم توفيرها من خلال خدمة "الشراء" ، فقد يُطلب منك تقديم بعض المعلومات ذات الصلة بعملية الشراء الخاصة بك ، بما في ذلك ، على سبيل المثال لا الحصر ، رقم بطاقة الائتمان الخاصة بك وتاريخ انتهاء صلاحيتها، عنوان إرسال الفواتير، و معلومات الشحن الخاصة بك. يقر المستخدم ويتعهد بما يلي:
                    </p>
                    <ul>
                        <li>
                            أنك تمتلك الحق القانوني في استخدام أي بطاقة (بطاقات) ائتمان أو طريقة (طُرق) دفع أخرى فيما يتعلق بأي عملية شراء
                        </li>
                        <li>
                            المعلومات التي تزودنا بها صحيحة و مكتملة. بتقديمك لهذه المعلومات ، فإنك تمنحنا الحق في تقديم المعلومات إلى طرف ثالث من أجل تسهيل إتمام عملية الشراء. نحتفظ بحق رفض أو إلغاء طلبك في أي وقت لأسباب محددة بما في ذلك على سبيل المثال لا الحصر: توافر المنتج أو الخدمة أو الأخطاء في الوصف أو سعر المنتج أو الخدمة أو إذا حدث خطأ في طلبك أو لأسباب أخرى

                        </li>
                    </ul>

                    <p>
                        <b>
                            نقبل المدفوعات عبر الإنترنت باستخدام بطاقة
                        </b>
                    </p>
                    <ul>
                        <li><b>Visa and MasterCard credit/debit</b> بالريال السعودي</li>
                    </ul>
                    <p>
                        <b class="green-text">
                            سيتم استرداد المبالغ المدفوعة فقط من خلال طريقة الدفع الأصلية
                        </b>
                    </p>
                </article>

                <article>
                    <h2>التوافر </h2>
                    <p>
                        نقوم بتحديث عروضنا من الخدمات باستمرار على نرعاكم. قد يتم تسعير المنتجات أو الخدمات المتوفرة على خدمتنا بطريقة خاطئة أو التوصيف بشكل غير دقيق أو تكون غير متوافرة ، وقد نواجه بعض التأخير في تحديث المعلومات على الخدمة وفي إعلاناتنا على المواقع الإلكترونية الأخرى. لا يمكننا ضمان دقة أو اكتمال أي معلومات ، بما في ذلك الأسعار وصور المنتج ومواصفاته وتوافره وخدماته. نحن نحتفظ بالحق في تغيير أو تحديث المعلومات وتصحيح الأخطاء أو عدم الدقة أو الحذف في أي وقت و دون إشعار مسبق

                    </p>
                </article>
                <article>
                    <h2>الحسابات</h2>
                    <p>
                        عند إنشاء حساب جديد في نرعاكم ، يجب عليك تزويدنا بمعلومات دقيقة ومكتملة وحديثة في جميع الأوقات. يشكل عدم القيام بذلك خرقاً واضحا للشروط ، و هذا قد يؤدي إلى التعليق الفوري لحسابك على خدمتنا أنت مسؤول عن حماية و حفظ كلمة المرور التي تستخدمها للوصول إلى الخدمة بالتالي عن أي أنشطة أو إجراءات تتم بموجب استخدام كلمة المرور الخاصة بك ، سواء كانت كلمة المرور الخاصة بك مع خدمتنا أو خدمة مقدمة من طرف ثالث. أنت توافق على عدم الكشف عن كلمة مرورك لأي طرف ثالث. يجب عليك إخطارنا بمجرد علمك بأي خرق للأمن أو الاستخدام غير المصرح به لحسابك. فيما يتعلق باختيار اسم المستخدم، فإنه لا يجوز لك استخدام اسم شخص أو كيان آخر أو أن يكون غير متاح قانونياً للاستخدام، أو أن يكون اسماً أو علامة تجارية تخضع لأي حقوق لشخص آخر أو كيان آخر غيرك دون الحصول على تصريح مسبق ، أو أن يكون اسماً مسيء أو مبتذل أو فاحش
                    </p>
                </article>
                <article>
                    <h2>الملكية الفكرية</h2>
                    <p>
                        هذه الخدمة ومحتواها الأصلي ومميزاتها و وظائفها هي في الأساس وستظل ملكية حصرية لشركة نرعاكم . هذه الخدمة محمية بموجب حقوق الطبع والنشر والعلامات التجارية والقوانين الأخرى السارية في كل من المملكة العربية السعودية والدول الأجنبية. لا يجوز استخدام علاماتنا التجارية السمات التجارية الخاصة بنا للترويج لمنتج أو خدمة أخرى دون موافقة كتابية مسبقة من شركتنا

                    </p>
                </article>
                <article>
                    <h2>
                        تحديد المسؤولية
                    </h2>
                    <p>
                        لن تتحمل شركة نرعاكم ، أو أي من مديريها أو موظفيها أو شركائها أو وكلائها أو مورديها أو الشركات التابعة لها بأي حال من الأحوال ، أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو عقابية
                    </p>
                    <p>
                        <b>
                            ما في ذلك على سبيل المثال لا الحصر ، خسارة الأرباح أو البيانات أو الاستخدام، أو غيرها من الخسائر غير الملموسة ، الناتجة عن
                        </b>
                    </p>
                    <ul>
                        <li>
                            وصولك إلى الخدمة أو استخدامها أو عدم القدرة على الوصول إليها أو استخدامها
                        </li>
                        <li>أي سلوك أو محتوى لأي طرف ثالث و متوافر على الخدمة</li>
                        <li>أي محتوى تم الحصول عليه من الخدمة</li>
                        <li>
                            الوصول غير المصرح به أو استخدام أو تغيير عمليات الإرسال أو المحتوى الخاص بك ، سواء كان ذلك على أساس الضمان أو العقد أو الضرر (بما في ذلك الإهمال) أو أي نظرية قانونية أخرى.
                        </li>
                    </ul>
                </article>
                <article>
                    <h2>إيقاف الخدمة</h2>
                    <p>
                        يحق لنا إنهاء أو تعليق حسابك على الفور ، دون إشعار مسبق أو
                        مسؤولية ، لأي سبب من الأسباب ، بما في ذلك على سبيل المثال لا
                        الحصر ، القيام بخرق الشروط المنصوص عليها. عند إيقاف الخدمة،
                        سيتوقف حقك في استخدام الخدمة على الفور. إذا كنت ترغب في إيقاف
                        حسابك ، يمكنك ببساطة التوقف عن استخدام الخدمة
                    </p>
                </article>
                <article>
                    <h2>القانون المعمول به</h2>
                    <p>
                        تخضع هذه الشروط وتُفسر وفقاً لقوانين المملكة العربية السعودية ، بغض النظر عن تعارضها مع أحكام القانون. إن الفشل في إنفاذ أي حق أو حكم من هذه الشروط لا يعتبر بأي شكل من الأشكال تنازلاً عن هذه الحقوق. إذا تم اعتبار أي بند من هذه الشروط غير صالح أو غير قابل للتنفيذ من قبل المحكمة ، فستظل الأحكام المتبقية من هذه الشروط سارية. تشكل هذه الشروط كامل الاتفاقية بيننا فيما يتعلق بالخدمة المقدمة من قبلنا، وتحل محل أي اتفاقات سابقة قد تكون بيننا بشأن الخدمة. - لن يتم تخزين أو بيع أو مشاركة أو تأجير أي بيانات بطاقات الائتمان / الخصم ومعلومات التعريف الشخصية لأي أطراف ثالثة. - لن يتم التعامل أو تقديم أي خدمات أو منتجات إلى أي من الدول الخاضعة لعقوبات مكتب مراقبة الأصول الأجنبية (OFAC) وفقًا لقانون المملكة العربية السعودية وهي بلد إقامتنا. - يخضع أي نزاع أو مطالبة تنشأ فيما يتعلق بهذا الموقع الإلكتروني وفقا لقوانين المملكة العربية السعودية ومتطلبات السلطة المختصة ويتم تفسيرها وفقًا لها
                    </p>
                </article>

                <article>
                    <h2>التغييرات</h2>
                    <p>
                        نحن نحتفظ بالحق ، حسب تقديرنا الخاص ، في تعديل أو استبدال هذه
                        الشروط في أي وقت. في حال المراجعة، سنحاول تقديم إشعار قبل 30
                        يوماً على الأقل قبل سريان مفعول أي شروط جديدة. إن ما يشكل
                        تغييراً مادياً سيتم تحديده وفقاً لتقديرنا فقط. من خلال الاستمرار
                        في الدخول إلى خدمتنا أو استخدامها بعد أن تصبح هذه المراجعات
                        فعالة ، فإنك تؤكد على موافقتك بالإلتزام بالشروط المنقحة. إذا كنت
                        لا توافق على الشروط الجديدة ، فيرجى التوقف عن استخدام الخدمة
                    </p>
                </article>
                <article>
                    <h2>تواصل معنا</h2>
                    <p>
                        في حال كان لديك أي أسئلة أو استفسارات حول هذه الشروط ، يرجى
                        التواصل معنا
                    </p>
                </article>
            </div>
        </div>
    </div>
</main>
</body>
</html>
`;

const PrivacyPolicy = () => {
    const navigation = useNavigation();
    const isRTL = I18nManager.isRTL;
    const windowWidth = Dimensions.get('window').width;

    const handleBack = () => {
        navigation.goBack();
    };

    const renderHeader = () => (
        <Header
            centerComponent={
                <Text numberOfLines={1} style={[globalTextStyles.h5, styles.headerTitle]}>
                    الشروط والأحكام
                </Text>
            }
            leftComponent={
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
            }
            containerStyle={styles.headerContainer}
        />
    );

    // Create a script to ensure Cairo font is applied and add debugging
    const injectScript = `
        (function() {
            
            // Function to apply Cairo font to all elements
            function applyCairoFont() {
                var allElements = document.querySelectorAll('*');
                var appliedCount = 0;
                
                for (var i = 0; i < allElements.length; i++) {
                    var element = allElements[i];
                    element.style.setProperty('font-family', "'Cairo', 'Arial', 'Helvetica', sans-serif", 'important');
                    appliedCount++;
                }
                
                
                // Also try setting it on the document root
                document.documentElement.style.setProperty('font-family', "'Cairo', 'Arial', 'Helvetica', sans-serif", 'important');
                document.body.style.setProperty('font-family', "'Cairo', 'Arial', 'Helvetica', sans-serif", 'important');
                
                // Force font on specific important elements
                var importantElements = document.querySelectorAll('h1, h2, h3, p, li, div, span, article, main, section');
                for (var j = 0; j < importantElements.length; j++) {
                    importantElements[j].style.setProperty('font-family', "'Cairo', 'Arial', 'Helvetica', sans-serif", 'important');
                }
            }
            
            // Apply font immediately
            applyCairoFont();
            
            // Apply font after a short delay to ensure DOM is ready
            setTimeout(applyCairoFont, 100);
            setTimeout(applyCairoFont, 500);
            setTimeout(applyCairoFont, 1000);
            
            // Apply font after fonts are loaded (if supported)
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(function() {
                    applyCairoFont();
                });
            }
            
            // Apply font periodically to catch any new elements
            setInterval(applyCairoFont, 1000);
            
            // Listen for DOM changes and apply font to new elements
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes) {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === 1) { // Element node
                                if (node.style) {
                                    node.style.setProperty('font-family', "'Cairo', 'Arial', 'Helvetica', sans-serif", 'important');
                                }
                                var childElements = node.querySelectorAll('*');
                                for (var k = 0; k < childElements.length; k++) {
                                    childElements[k].style.setProperty('font-family', "'Cairo', 'Arial', 'Helvetica', sans-serif", 'important');
                                }
                            }
                        });
                    }
                });
            });
            
            // Start observing
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            true; // Return true to indicate script execution
        })();
    `;

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <View style={styles.webViewContainer}>
                <WebView
                    source={{ html: termsHtmlContent }}
                    style={styles.webView}
                    originWhitelist={['*']}
                    scalesPageToFit={Platform.OS === 'android'}
                    showsVerticalScrollIndicator={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    textZoom={100}
                    startInLoadingState={true}
                    automaticallyAdjustContentInsets={false}
                    scrollEnabled={true}
                    bounces={false}
                    injectedJavaScript={injectScript}
                    onMessage={(event) => {
                    }}
                    onError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                    }}
                    onHttpError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                    }}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    headerTitle: {
        color: '#000',
    },
    headerContainer: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    backButton: {
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    webViewContainer: {
        flex: 1,
        marginTop:1,
    },
    webView: {
        flex: 1,
        backgroundColor: 'white',
    },
});

export default PrivacyPolicy;
