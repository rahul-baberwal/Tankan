/* Exam presets, original practice passages and lesson definitions. */
(function () {
  'use strict';

  /* Practice defaults based on public exam notices as reported by typinghub.in,
     typingmitra.in and exam-prep sites (Oct 2026). Every preset is editable;
     always read the notice you applied under. */
  var EXAMS = [
    { id: 'bsf-hcm-en', icon: '🪖', name: 'BSF · HCM / ASI', sub: 'English', lang: 'en', pool: 'general', min: 10, wpm: 35, kdph: 10500, err: 5, backspace: true, difficulty: 'medium',
      note: '35 WPM (equivalent to 10,500 Key Depressions Per Hour) in 10 minutes. 5% error tolerance. BSF Head Constable Ministerial & ASI.' },
    { id: 'bsf-hcm-hi', icon: '🪖', name: 'BSF · HCM / ASI', sub: 'हिंदी', lang: 'hi', pool: 'hindi', min: 10, wpm: 30, kdph: 9000, err: 5, backspace: true, difficulty: 'medium',
      note: '30 WPM (equivalent to 9,000 Key Depressions Per Hour) in 10 minutes, Unicode Mangal. 5% error tolerance. BSF Head Constable Ministerial & ASI.' },
    { id: 'ssc-chsl-en', icon: '🏢', name: 'SSC CHSL · LDC/JSA', sub: 'English', lang: 'en', pool: 'general', min: 10, wpm: 35, err: 5, backspace: true, difficulty: 'medium',
      note: '35 WPM in 10 minutes. Qualifying test.' },
    { id: 'ssc-chsl-hi', icon: '🏢', name: 'SSC CHSL · LDC/JSA', sub: 'हिंदी', lang: 'hi', pool: 'hindi', min: 10, wpm: 30, err: 5, backspace: true, difficulty: 'medium',
      note: '30 WPM in 10 minutes, Unicode Mangal.' },
    { id: 'ssc-cgl-dest', icon: '📊', name: 'SSC CGL · DEST', sub: 'Data entry', lang: 'en', pool: 'general', min: 15, kdph: 8000, err: 5, backspace: true, difficulty: 'medium',
      note: 'About 2,000 key depressions in 15 minutes (8,000 per hour).' },
    { id: 'ssc-deo-15k', icon: '🖥️', name: 'SSC CHSL · DEO', sub: '15,000 KDPH', lang: 'en', pool: 'general', min: 15, kdph: 15000, err: 5, backspace: true, difficulty: 'hard',
      note: 'Data entry operator grade: about 3,750 key depressions in 15 minutes.' },
    { id: 'rrb-ntpc-en', icon: '🚆', name: 'RRB NTPC', sub: 'English', lang: 'en', pool: 'general', min: 10, wpm: 30, err: 5, backspace: false, difficulty: 'hard',
      note: '30 WPM in 10 minutes. Backspace is locked, as in the railway test.' },
    { id: 'rrb-ntpc-hi', icon: '🚆', name: 'RRB NTPC', sub: 'हिंदी', lang: 'hi', pool: 'hindi', min: 10, wpm: 25, err: 5, backspace: false, difficulty: 'hard',
      note: '25 WPM in 10 minutes. Backspace is locked.' },
    { id: 'sc-jca', icon: '⚖️', name: 'Supreme Court · JCA', sub: 'Legal English', lang: 'en', pool: 'legal', min: 10, wpm: 35, err: 3, backspace: true, difficulty: 'hard',
      note: '35 WPM in 10 minutes, mistakes up to 3%. Legal passages.' },
    { id: 'hc-clerk', icon: '🏛️', name: 'High Court clerk', sub: 'Legal English', lang: 'en', pool: 'legal', min: 10, wpm: 35, err: 5, backspace: true, difficulty: 'hard',
      note: 'Courts differ: 30 to 40 WPM. Edit the speed to match your notice.' },
    { id: 'cpct-en', icon: '🎓', name: 'MP CPCT', sub: 'English', lang: 'en', pool: 'general', min: 15, wpm: 30, err: 5, backspace: true, difficulty: 'medium',
      note: '30 WPM in 15 minutes.' },
    { id: 'cpct-hi', icon: '🎓', name: 'MP CPCT', sub: 'हिंदी', lang: 'hi', pool: 'hindi', min: 15, wpm: 25, err: 5, backspace: true, difficulty: 'medium',
      note: '25 WPM in 15 minutes.' },
    { id: 'up-police', icon: '👮', name: 'UP Police · clerk', sub: 'English', lang: 'en', pool: 'general', min: 10, wpm: 30, err: 5, backspace: true, difficulty: 'medium',
      note: '30 WPM in 10 minutes.' },
    { id: 'kvs-jsa', icon: '🏫', name: 'KVS / NVS · JSA', sub: 'English', lang: 'en', pool: 'general', min: 10, wpm: 35, err: 5, backspace: true, difficulty: 'medium',
      note: '35 WPM in 10 minutes.' },
    { id: 'crpf-hcm', icon: '🛡️', name: 'CRPF / CISF · HCM', sub: 'English', lang: 'en', pool: 'general', min: 10, wpm: 35, err: 5, backspace: true, difficulty: 'medium',
      note: '35 WPM in 10 minutes.' },
    { id: 'rsmssb-patwari', icon: '🌾', name: 'Rajasthan · Patwari', sub: 'हिंदी', lang: 'hi', pool: 'hindi', min: 10, wpm: 25, err: 5, backspace: true, difficulty: 'medium',
      note: '25 WPM in 10 minutes.' },
    { id: 'rajhc-hi', icon: '🏛️', name: 'Rajasthan High Court', sub: 'हिंदी', lang: 'hi', pool: 'hindi', min: 10, wpm: 25, err: 5, backspace: true, difficulty: 'medium',
      note: '25 WPM in 10 minutes.' }
  ];

  var QUICK = [
    { id: 'q1', icon: '⚡', name: '1 minute sprint', sub: 'English', lang: 'en', pool: 'general', min: 1, wpm: 0, err: 100, backspace: true, difficulty: 'low', note: 'Warm up test with easy vocabulary.' },
    { id: 'q3', icon: '⏱️', name: '3 minute test', sub: 'English', lang: 'en', pool: 'general', min: 3, wpm: 0, err: 100, backspace: true, difficulty: 'low', note: 'Short, honest practice.' },
    { id: 'q5', icon: '🕔', name: '5 minute test', sub: 'English', lang: 'en', pool: 'general', min: 5, wpm: 0, err: 100, backspace: true, difficulty: 'medium', note: 'Good for daily practice.' },
    { id: 'q5h', icon: '🪔', name: '5 मिनट टेस्ट', sub: 'हिंदी', lang: 'hi', pool: 'hindi', min: 5, wpm: 0, err: 100, backspace: true, difficulty: 'medium', note: 'हिंदी टाइपिंग अभ्यास।' }
  ];

  /* ================== PASSAGES BY DIFFICULTY ================== */

  /* LOW (EASY) - ENGLISH: Simple everyday vocabulary, shorter sentences, standard punctuation */
  var EASY_EN = [
    'Walking early in the morning is one of the best habits for good health. The morning air is clean and cool, and the streets are quiet before the rush of traffic begins. A thirty minute walk gives energy for the whole day, helps the mind stay calm and keeps the body active. Doctors advise people of all ages to walk regularly instead of sitting for long hours.',
    'A garden full of green plants brings happiness to every home. Flowers of bright colours bloom in the warm sun and bees visit them from early morning. Children love to water the little plants and watch new leaves grow day after day. Looking after a small patch of green teaches patience and love for nature.',
    'Reading story books is a wonderful hobby for students. A good book takes the reader to distant lands and introduces interesting people. When we read every day, our vocabulary grows and our writing becomes much better. Many schools have a quiet library where students can sit comfortably and choose any book they like.',
    'Discipline and regular training are the foundation of service in the Border Security Force. Recruits wake up before dawn to begin physical exercises and drill on the parade ground. They learn to march together in step, follow orders with precision and support each other through every task. Clean uniforms, polished boots and a steady mind are the marks of a dedicated jawan.',
    'Friendly dogs and domestic animals have lived alongside humans for centuries. They guard our houses at night and greet us with excitement when we return home from work. Taking care of an animal requires kindness, regular food and clean water. In return, they offer loyalty and bring warmth to the entire family.',
    'Sports day in school is always full of fun and excitement. Students prepare for races and games for many weeks in advance. The ground is decorated with colourful flags and parents come to cheer for their children. Playing games teaches us that taking part and trying our best is more important than simply winning a medal.',
    'Traveling by bus to a nearby town or village fair is an enjoyable experience. Passengers sit near the windows to enjoy the view of green fields, tall trees and flowing rivers. At the fair, stalls sell sweet treats, wooden toys and colourful clothes, bringing joy to both young and old visitors.',
    'Eating fresh fruit and green vegetables keeps our immune system strong. Natural foods provide essential vitamins and minerals that protect us from common illnesses. Drinking enough water and avoiding oily junk food helps us feel light and energetic throughout the working day.'
  ];

  /* MEDIUM - ENGLISH: Standard government exam passages (General + BSF HCM ministerial administration) */
  var GENERAL_EN = [
    'The railway network of the country carries millions of passengers every day and moves a large share of its freight. Trains connect small villages to big cities, and many families depend on them for work, study and medical care. Over the years the network has added new lines, faster engines and cleaner stations. Officers say that regular maintenance and careful planning are the best ways to keep travel safe. Passengers are asked to buy tickets in advance, to keep the platforms clean and to follow the instructions given by the staff.',
    'A good office depends on clear records. Every letter that arrives must be entered in the register, given a number and sent to the right desk. When a file moves from one table to another, the date and the name of the person receiving it should be written down. Clerks who keep neat and accurate records save the department a great deal of time. A missing paper can delay a decision for weeks, so careful habits matter more than speed alone.',
    'The Head Constable Ministerial in the Border Security Force performs crucial administrative and clerical duties that support operations at every level. From drafting official dispatches to managing personnel records, the ministerial staff maintains the administrative spine of the battalion. Accuracy in typing and thorough knowledge of service rules ensure that leave requests, allowances and ration sanctions are processed without error. Discipline in paperwork is just as vital as vigilance on the international border.',
    'Water is one of the most precious resources of any country. Rivers, lakes and wells supply drinking water, and farmers rely on canals and rain to grow their crops. In recent years many towns have faced shortages during the summer months. Local bodies are now building small dams, repairing old tanks and teaching people to use water with care. Simple steps such as fixing a leaking tap or collecting rain from a roof can make a real difference to a neighbourhood.',
    'Digital services have changed the way citizens deal with the government. Forms that once needed a visit to three different offices can now be filled from a phone in a few minutes. Certificates, pension slips and tax receipts can be downloaded at any hour. However, many people in remote areas still need help with these services. Common service centres and trained volunteers play an important part by guiding them patiently, one step at a time.',
    'In paramilitary headquarters, official communications must adhere strictly to established formats and channels of reporting. Every signal, memorandum and circular is assigned a reference number and classified according to its urgency. Clerks and assistants are trained to draft clear summaries of complex policy matters for superior officers. Punctuality and methodical filing ensure that urgent operational instructions reach remote border posts without delay.',
    'Education opens the door to better opportunities for young people. A child who learns to read well can follow instructions, understand rules and make wise choices later in life. Teachers often work with limited books and crowded rooms, yet they continue to encourage their students. Parents, too, have a role to play by asking about homework and sending children to school on time. A community that values learning grows stronger with every passing year.',
    'Forests cover a significant part of the land and provide shelter to thousands of kinds of birds, insects and animals. They also protect the soil from heavy rain and keep the air fresh. When trees are cut without care, rivers carry away the loose earth and floods become more common. Forest officers work with villagers to plant new saplings and to guard the older trees. Each person can help by planting a tree and by looking after it until it stands on its own.',
    'Health workers visit villages to give vaccines to children and to check the weight of new mothers. They carry simple records and note down every visit with the date. Clean drinking water, regular meals and rest are the first steps towards good health, and they cost very little. A person who feels unwell for more than a few days should visit the nearest health centre instead of waiting. Early advice from a doctor can prevent small problems from growing into serious ones.',
    'The postal service has served the country for more than a hundred and fifty years. Letters, parcels and money orders travel by road, rail and air to reach every corner of the land. In the age of mobile phones the number of letters has fallen, but parcels and banking services have grown. The post office in a small village is often the only place where people can send money to a relative in another state. Its staff are known for being honest and for working in all weather.',
    'Electricity has reached most homes, but supply is still uneven in some regions. Power plants burn coal, use falling water or catch the wind and the sun to make energy. Solar panels on rooftops are becoming popular because they lower the monthly bill and cause no smoke. Engineers advise families to switch off lights and fans when they leave a room. If every household saves a little, the whole grid becomes more reliable for hospitals, schools and factories.',
    'Roads are the lifelines of trade. A truck loaded with grain, vegetables or cloth must travel many hundreds of kilometres before it reaches the market. Smooth highways reduce the time and the cost of such journeys. Drivers are expected to follow speed limits, wear seat belts and rest at regular intervals. Traffic police place signs and signals to keep everyone safe, and a few extra minutes of patience can prevent a serious accident.',
    'Banks help people save money and borrow it when they have a genuine need. A savings account pays a small interest and keeps the money safe from theft. Customers should never share their secret numbers or passwords with anyone, even a person who claims to work for the bank. Before signing any form, it is wise to read it twice and to ask about the charges. Honest advice at the counter has helped many families plan for school fees and weddings.',
    'Farmers rise early to work in the fields. They plough the land, sow the seeds and water the crops, and then they wait for the harvest. A late rain or a sudden storm can damage the whole season. Crop insurance and weather reports now help them to prepare. Markets nearby buy the grain at fixed prices, and cooperative societies lend tools at a fair rent. The country depends on the labour of its farmers every single day.',
    'Sports bring people together and teach discipline, teamwork and the courage to accept defeat. A cricket match on a village ground can draw a crowd of hundreds, while a young athlete training before dawn may dream of the national team. Schools are encouraged to keep time for games along with lessons. Coaches say that regular practice, a balanced diet and enough sleep are more useful than any shortcut. Winning is pleasant, but playing fairly is better.',
    'Libraries are quiet places where anyone may read for free. A good library keeps newspapers, reference books and stories for children on the same shelves. Students prepare for examinations at its long tables, and retired people come to read the morning papers. Librarians are glad to help a new visitor find a book. When a member returns a book late, a small fine is charged, and the money is used to buy new titles for everyone.',
    'Festivals fill the calendar with colour and music. Families clean their homes, cook special food and visit relatives and neighbours. Markets stay open late and children wait for sweets and new clothes. Municipal teams arrange extra lights and sweepers so that the streets stay safe and tidy. People of many faiths take part in each other\'s celebrations, and this habit of sharing is one of the great strengths of the nation.'
  ];

  /* HARD - ENGLISH: Legal passages, statutory rules, technical administration and dense vocabulary */
  var HARD_EN = [
    'The petitioner respectfully submits that the order dated the fourteenth day of March was passed without giving him a reasonable opportunity of being heard. It is a settled principle of natural justice that no person shall be condemned unheard. The respondent has not placed on record any document to show that notice was duly served. The petitioner therefore prays that the impugned order be set aside and that the matter be remitted to the competent authority for fresh consideration in accordance with law.',
    'Having heard the learned counsel for both the parties and having perused the record, this Court is of the view that the appeal deserves to be admitted. The delay in filing the appeal has been explained in the affidavit, and the explanation appears to be satisfactory. Notice be issued to the respondents, returnable on the next date of hearing. Until then, the operation of the order under challenge shall remain stayed, and no coercive steps shall be taken against the appellant.',
    'Under the provisions of the Border Security Force Act, 1968, personnel subject to the Act are governed by statutory standards of discipline, command hierarchy and operational readiness. In disciplinary proceedings or summary court martial records, every statement of evidence must be meticulously transcribed and authenticated by the presiding officer. Any material discrepancy or omission in recording the depositions may vitiate the proceedings on grounds of non-compliance with statutory procedure and constitutional guarantees under Article 21.',
    'The accused was produced before the Magistrate within twenty-four hours of his arrest, as required by the Constitution. The prosecution has stated that the investigation is still in progress and that certain witnesses are yet to be examined. The defence has argued that the custody of the accused is no longer necessary. After considering the nature of the allegations, the Court grants bail on the condition that the accused shall surrender his passport and appear before the police station every Monday.',
    'The agreement between the parties provides that any dispute arising out of the contract shall first be referred to arbitration. The arbitrator shall be appointed by mutual consent within thirty days of a written request. The seat of arbitration shall be Jaipur, and the proceedings shall be conducted in English. Each party shall bear its own costs unless the arbitrator directs otherwise. The award, once passed, shall be final and binding upon both the parties and their legal representatives.',
    'Procurement of goods and services across Central Armed Police Forces must comply strictly with the General Financial Rules (GFR, 2017) and electronic tendering norms via the Government e-Marketplace (GeM). Ministerial staff handling budget allocations must verify performance bank guarantees, tender scrutiny sheets and delivery timelines before countersigning sanction orders. Failure to identify billing irregularities exposes administrative units to statutory audit objections from the Comptroller and Auditor General.',
    'Under the Right to Information Act, every citizen has the right to request information from a public authority. The authority is required to reply within thirty days, and a reasoned order must be given if the information is refused. An applicant who is not satisfied may file a first appeal before the senior officer and a second appeal before the Information Commission. The Act promotes transparency, reduces corruption and makes officers answerable to the people whom they serve.',
    'The learned trial court recorded the statements of eleven witnesses and examined the documents exhibited by the prosecution. It found that the chain of circumstances was complete and that the evidence led only to the guilt of the accused. The High Court has re-appreciated the evidence and finds no illegality in the judgment. The appeal is accordingly dismissed, and the accused shall surrender before the trial court to serve the remaining part of the sentence.',
    'Information security protocols in ministerial branches require strict adherence to data encryption standards, restricted local network access and periodic audits of digital archives. Classified correspondence regarding troop movements, logistical stockpiles and intelligence briefings must not be stored on unauthorized portable storage devices. Any breach of confidentiality constitutes an actionable offense under the Official Secrets Act and relevant defense personnel conduct regulations.'
  ];

  /* LOW (EASY) - HINDI: सरल शब्दावली, आसान वाक्य, बुनियादी विषय */
  var EASY_HI = [
    'सुबह की ताज़ी हवा में घूमना स्वास्थ्य के लिए बहुत लाभदायक होता है। सुबह के समय वातावरण शांत रहता है और पक्षियों की मीठी आवाज़ सुनाई देती है। रोज़ाना आधा घंटा टहलने से शरीर में नई ऊर्जा आती है और दिन भर मन प्रसन्न रहता है। सभी लोगों को सुबह जल्दी उठने की आदत डालनी चाहिए।',
    'पेड़-पौधे हमारे वातावरण को सुंदर और हरा-भरा बनाते हैं। घर के आँगन या छत पर छोटे-छोटे पौधे लगाने से मन को शांति मिलती है। बच्चे पौधों में पानी डालते हैं और नए फूलों को देखकर खुश होते हैं। हमें अधिक से अधिक पेड़ लगाने चाहिए और उनकी रक्षा करनी चाहिए।',
    'समय का सही उपयोग करना हर विद्यार्थी के लिए आवश्यक है। जो विद्यार्थी अपना काम समय पर पूरा करते हैं, वे परीक्षा में अच्छे अंक प्राप्त करते हैं। समय किसी की प्रतीक्षा नहीं करता, इसलिए हमें आज का काम कल पर नहीं टालना चाहिए। नियमित अध्ययन ही सफलता की कुंजी है।',
    'सीमा सुरक्षा बल में जवानों का अनुशासन देखने योग्य होता है। सुबह के समय मैदान पर दौड़ और व्यायाम से दिन की शुरुआत होती है। सभी जवान एक साथ कदमताल करते हैं और देश की सेवा के लिए तत्पर रहते हैं। साफ़ वर्दी और सतर्क दृष्टि हर जवान की पहचान होती है।',
    'किताबें हमारी सच्ची मार्गदर्शक होती हैं। अच्छी पुस्तकें पढ़ने से ज्ञान बढ़ता है और सही और गलत का अंतर समझ में आता है। विद्यालय के पुस्तकालय में बैठकर शांति से पढ़ना एक बहुत अच्छी आदत है। हर व्यक्ति को प्रतिदिन कुछ समय अध्ययन के लिए निकालना चाहिए।',
    'गाँव का जीवन बहुत सरल और प्राकृतिक होता है। चारों तरफ हरे-भरे खेत और खुले मैदान दिखाई देते हैं। लोग मिल-जुलकर काम करते हैं और त्योहारों को धूमधाम से मनाते हैं। ताज़ा भोजन और शुद्ध पानी गाँव के लोगों को स्वस्थ बनाए रखता है।'
  ];

  /* MEDIUM - HINDI: मानक सरकारी परीक्षा गद्यांश (कार्यालयीन, सामाजिक एवं BSF HCM संदर्भ) */
  var GENERAL_HI = [
    'भारत एक विशाल देश है जहाँ अनेक भाषाएँ बोली जाती हैं और अनेक त्योहार मनाए जाते हैं। यहाँ के लोग मिल-जुलकर रहते हैं और एक-दूसरे के सुख-दुख में साथ देते हैं। गाँव हो या शहर, हर जगह परिश्रम करने वाले लोग देश को आगे बढ़ा रहे हैं। किसान खेतों में अनाज उगाते हैं, मज़दूर सड़कें और पुल बनाते हैं और शिक्षक बच्चों को पढ़ाते हैं। सबके सहयोग से ही देश की उन्नति संभव है।',
    'सरकारी कार्यालयों में प्रत्येक पत्र का रिकॉर्ड रखा जाता है। जब कोई पत्र आता है तो उसे रजिस्टर में दर्ज किया जाता है और संबंधित अधिकारी के पास भेजा जाता है। फ़ाइल जिस मेज़ पर जाती है, उसकी तारीख लिखी जाती है। साफ़ और सही लिखावट से काम जल्दी होता है और गलती की संभावना कम रहती है। एक कुशल लिपिक अपने कार्य को समय पर पूरा करता है और सबके साथ विनम्रता से बात करता है।',
    'सीमा सुरक्षा बल में हेड कांस्टेबल मिनिस्ट्रियल का पद अत्यंत महत्वपूर्ण और जिम्मेदारी भरा होता है। वाहिनी के प्रशासनिक कार्यों, पत्राचार, जवानों के सेवा अभिलेखों तथा अवकाश के आवेदनों का सटीक संधारण इन्हीं के द्वारा किया जाता है। टंकण की गति और शुद्धता कार्यालयीन कामकाज को गति प्रदान करती है। नियमों का सही ज्ञान होने से प्रशासनिक त्रुटियों की संभावना समाप्त हो जाती है।',
    'पानी हमारे जीवन के लिए बहुत आवश्यक है। नदियाँ, तालाब और कुएँ हमें पीने का पानी देते हैं और खेतों की सिंचाई में भी काम आते हैं। गर्मी के दिनों में कई स्थानों पर पानी की कमी हो जाती है। इसलिए हमें पानी को व्यर्थ नहीं बहाना चाहिए। नल को खुला नहीं छोड़ना चाहिए और वर्षा के जल को इकट्ठा करना चाहिए। थोड़ी-सी सावधानी से हम आने वाली पीढ़ियों के लिए जल बचा सकते हैं।',
    'शिक्षा से ही मनुष्य का जीवन सुधरता है। पढ़े-लिखे लोग अपने अधिकारों और कर्तव्यों को समझते हैं और सही निर्णय ले पाते हैं। अनेक विद्यालयों में अब कंप्यूटर और पुस्तकालय की सुविधा भी उपलब्ध है। माता-पिता को चाहिए कि वे बच्चों को नियमित रूप से विद्यालय भेजें और उनके अध्ययन में रुचि लें। जो समाज शिक्षा को महत्व देता है, वह निरंतर प्रगति करता है।',
    'केंद्रीय सशस्त्र पुलिस बलों में पत्राचार की एक सुव्यवस्थित प्रणाली होती है। मुख्यालय से आने वाले दिशा-निर्देशों को तुरंत संबंधित शाखाओं तक पहुँचाना आवश्यक होता है। लिपिकीय संवर्ग को फाइलों के संधारण, प्रेषण पंजिका और गोपनीय दस्तावेजों की सुरक्षा का विशेष ध्यान रखना पड़ता है। कार्य में समयबद्धता और निष्ठा से ही संपूर्ण बल की कार्यप्रणाली सुचारू रूप से चलती है।',
    'वृक्ष हमारे सच्चे मित्र हैं। वे हमें छाया, फल, फूल और शुद्ध हवा देते हैं। वर्षा कराने में भी पेड़ों का बड़ा योगदान होता है। जब जंगल कटते हैं तो मिट्टी बह जाती है और बाढ़ का खतरा बढ़ जाता है। हम सबको चाहिए कि हर वर्ष कम से कम एक पौधा लगाएँ और उसकी देखभाल करें। हरा-भरा वातावरण स्वस्थ जीवन की पहचान है।',
    'डाक विभाग देश के कोने-कोने तक चिट्ठियाँ और पार्सल पहुँचाता है। गाँवों में डाकघर लोगों के लिए बैंक का काम भी करता है। लोग वहाँ अपनी बचत जमा करते हैं और अपने परिजनों को धन भेजते हैं। डाकिया धूप, वर्षा और सर्दी की परवाह किए बिना घर-घर जाता है। उसकी ईमानदारी और परिश्रम के कारण लोगों का उस पर गहरा विश्वास है।',
    'स्वास्थ्य सबसे बड़ा धन है। प्रतिदिन सुबह उठकर टहलना, संतुलित भोजन करना और पर्याप्त नींद लेना अच्छे स्वास्थ्य के लिए आवश्यक है। बीमार होने पर पास के स्वास्थ्य केंद्र में जाकर चिकित्सक की सलाह लेनी चाहिए। टीकाकरण से बच्चों को अनेक रोगों से बचाया जा सकता है। स्वच्छता का ध्यान रखने से भी हम बहुत-सी बीमारियों से दूर रह सकते हैं।',
    'त्योहार हमारे जीवन में उमंग और उत्साह भर देते हैं। दीपावली पर घर रोशनी से जगमगा उठते हैं और बाज़ारों में चहल-पहल बढ़ जाती है। लोग एक-दूसरे को मिठाई बाँटते हैं और शुभकामनाएँ देते हैं। होली रंगों का त्योहार है जो हमें आपसी भेदभाव भुलाकर गले मिलना सिखाता है। ऐसे अवसर हमारी संस्कृति को जीवित रखते हैं और समाज को जोड़ते हैं।'
  ];

  /* HARD - HINDI: विधिक, प्रशासनिक एवं संवैधानिक शब्दावली */
  var HARD_HI = [
    'याचिकाकर्ता ससम्मान यह निवेदन करता है कि दिनांक चौदह मार्च को पारित आदेश प्राकृतिक न्याय के सिद्धांतों के पूर्णतः विपरीत है। विधि का यह सुस्थापित नियम है कि किसी भी व्यक्ति को सुनवाई का उचित अवसर दिए बिना दंडित नहीं किया जा सकता। विपक्षी ने ऐसा कोई साक्ष्य प्रस्तुत नहीं किया है जिससे यह सिद्ध हो सके कि नोटिस की तामीली नियमानुसार की गई थी। अतः आक्षेपित आदेश को निरस्त कर प्रकरण सक्षम प्राधिकारी को पुनर्विचार हेतु भेजा जाए।',
    'सीमा सुरक्षा बल अधिनियम, 1968 तथा इसके अधीन बनाए गए नियमों के अनुसार बल के प्रत्येक सदस्य पर कठोर अनुशासन और कर्तव्यों के निर्वहन का वैधानिक दायित्व है। सारांश बल न्यायालय अथवा विभागीय जाँच की कार्यवाहियों में साक्ष्यों का अभिलेखन अत्यंत सावधानीपूर्वक किया जाना अनिवार्य है। विधिक प्रक्रियाओं का उल्लंघन होने की दशा में संविधान के अनुच्छेद 226 के अंतर्गत माननीय उच्च न्यायालय में रिट याचिका प्रस्तुत की जा सकती है।',
    'दोनों पक्षों के विद्वान अधिवक्ताओं के तर्कों को सुनने तथा अभिलेख का परिशीलन करने के पश्चात यह न्यायालय इस निष्कर्ष पर पहुँचता है कि अपील विचारणीय है। अपील दायर करने में हुए विलंब का समुचित कारण शपथ पत्र में स्पष्ट किया गया है जो संतोषजनक प्रतीत होता है। अतः प्रतिवादियों को नोटिस जारी किया जाए तथा आगामी सुनवाई तक आक्षेपित आदेश के क्रियान्वयन पर स्थगन आदेश प्रभावी रहेगा।',
    'शासकीय कार्यालयों में वित्तीय अनुशासन बनाए रखने हेतु सामान्य वित्तीय नियमावली (जीएफआर) के प्रावधानों का अक्षरशः पालन आवश्यक है। जेम पोर्टल के माध्यम से सामग्री और सेवाओं की खरीद में पारदर्शिता और प्रतिस्पर्धा सुनिश्चित की जानी चाहिए। लिपिकीय संवर्ग द्वारा बिलों के सत्यापन तथा बजट आवंटन की गहन जाँच से अंकेक्षण आपत्तियों का समय रहते निराकरण संभव हो पाता है।',
    'सूचना का अधिकार अधिनियम, 2005 नागरिकों को शासन की कार्यप्रणाली में पारदर्शिता और उत्तरदायित्व सुनिश्चित करने का सशक्त माध्यम प्रदान करता है। लोक सूचना अधिकारी को तीस दिन की निर्धारित समयावधि के भीतर आवेदक को वांछित सूचना उपलब्ध करानी होती है। सूचना देने से इनकार करने की स्थिति में प्रासंगिक वैधानिक उपबंधों के अंतर्गत कारण स्पष्ट करना अनिवार्य होता है।',
    'विद्वान विचारण न्यायालय ने अभियोजन पक्ष के ग्यारह साक्षियों के बयान दर्ज किए और प्रदर्शित दस्तावेजों की सूक्ष्मता से जाँच की। न्यायालय ने पाया कि परिस्थितियों की श्रृंखला पूरी तरह जुड़ी हुई थी और साक्ष्य केवल अभियुक्त के दोष की ओर संकेत करते थे। उच्च न्यायालय ने भी साक्ष्यों का पुनर्मूल्यांकन करते हुए निर्णय में किसी प्रकार की अवैधता नहीं पाई और अपील को निरस्त कर दिया।'
  ];

  /* Helper to get passage pool by language, pool type, and difficulty */
  function getPassagePool(lang, poolType, difficulty) {
    if (poolType === 'legal') return HARD_EN;
    var diff = (difficulty || 'medium').toLowerCase();
    if (diff === 'easy') diff = 'low';
    if (lang === 'hi') {
      if (diff === 'low') return EASY_HI;
      if (diff === 'hard') return HARD_HI;
      return GENERAL_HI;
    }
    if (diff === 'low') return EASY_EN;
    if (diff === 'hard') return HARD_EN;
    return GENERAL_EN;
  }

  var POOLS = {
    general: GENERAL_EN,
    legal: HARD_EN,
    hindi: GENERAL_HI,
    easy_en: EASY_EN,
    medium_en: GENERAL_EN,
    hard_en: HARD_EN,
    easy_hi: EASY_HI,
    medium_hi: GENERAL_HI,
    hard_hi: HARD_HI
  };

  /* Data-entry text for DEST style practice: mixed names, codes and amounts. */
  var NAMES = ['Ramesh Kumar', 'Sunita Devi', 'Mohan Lal', 'Anita Sharma', 'Vikram Singh', 'Kavita Meena', 'Harish Chand', 'Pooja Yadav', 'Deepak Joshi', 'Sarita Bairwa', 'Manoj Gupta', 'Rekha Jain', 'Suresh Patel', 'Geeta Rathore', 'Nitin Verma', 'Lakshmi Nair'];
  var PLACES = ['Jaipur', 'Bikaner', 'Churu', 'Sikar', 'Ajmer', 'Kota', 'Jodhpur', 'Udaipur', 'Alwar', 'Bharatpur', 'Nagaur', 'Pali'];
  function dataEntry(words, seed) {
    var r = window.TKEngine.rng(seed || Date.now() & 0xffffffff), out = [], count = 0;
    function pick(a) { return a[Math.floor(r() * a.length)]; }
    function num(d) { var s = ''; for (var i = 0; i < d; i++) s += Math.floor(r() * 10); return s; }
    while (count < words) {
      var line = pick(NAMES) + ', ' + pick(PLACES) + ', Ref ' + num(2) + '/' + (2020 + Math.floor(r() * 7)) + '-' + num(4) + ', Rs. ' + num(3) + ',' + num(3) + '.' + num(2) + ',';
      out.push(line); count += line.split(' ').length;
    }
    return out.join(' ').replace(/,$/, '.');
  }

  /* Lessons: each builds random text from a character set. */
  var LESSONS = [
    { id: 1, title: 'Home row', emoji: '🏠', keys: 'asdfjkl;', wpm: 12 },
    { id: 2, title: 'Home row, reaching', emoji: '🤏', keys: 'asdfjkl;gh', wpm: 14 },
    { id: 3, title: 'Top row', emoji: '⬆️', keys: 'qwertyuiop', wpm: 15 },
    { id: 4, title: 'Bottom row', emoji: '⬇️', keys: 'zxcvbnm,.', wpm: 15 },
    { id: 5, title: 'All letters', emoji: '🔤', keys: 'abcdefghijklmnopqrstuvwxyz', wpm: 20 },
    { id: 6, title: 'Capital letters', emoji: '🔠', keys: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', wpm: 20 },
    { id: 7, title: 'Number row', emoji: '🔢', keys: '1234567890', wpm: 18 },
    { id: 8, title: 'Punctuation', emoji: '❝', keys: 'abcdefghijklmnopqrstuvwxyz.,;:\'"-()?!', wpm: 20 },
    { id: 9, title: 'Common words', emoji: '📖', words: ['the', 'of', 'and', 'to', 'in', 'is', 'that', 'for', 'it', 'was', 'on', 'are', 'with', 'as', 'be', 'at', 'this', 'have', 'from', 'or', 'by', 'one', 'had', 'not', 'but', 'what', 'all', 'were', 'when', 'we', 'there', 'can', 'an', 'your', 'which', 'their', 'said', 'if', 'do', 'will', 'each', 'about', 'how', 'up', 'out', 'them', 'then', 'she', 'many', 'some'], wpm: 25 },
    { id: 10, title: 'Office vocabulary', emoji: '🗂️', words: ['department', 'register', 'application', 'certificate', 'signature', 'approval', 'reference', 'attendance', 'accounts', 'salary', 'allowance', 'inspection', 'notification', 'forwarded', 'enclosed', 'recommended', 'sanctioned', 'receipt', 'voucher', 'proceedings', 'subject', 'urgent', 'confidential', 'annexure'], wpm: 25 },
    { id: 11, title: 'Data entry', emoji: '🧾', keys: '0123456789/-.,', wpm: 25 },
    { id: 12, title: 'Exam passage', emoji: '🎯', passage: true, wpm: 30 }
  ];

  window.TKData = {
    EXAMS: EXAMS,
    QUICK: QUICK,
    POOLS: POOLS,
    LESSONS: LESSONS,
    getPassagePool: getPassagePool,
    dataEntry: dataEntry
  };
})();
