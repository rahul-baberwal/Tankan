/* Exam presets, original practice passages and lesson definitions. */
(function () {
  'use strict';

  /* Practice defaults based on public exam notices as reported by typinghub.in,
     typingtest.indgovtjobs.net and exam-prep sites (Oct 2026). Every preset is editable;
     always read the notice you applied under. */
  var EXAMS = [
    { id: 'ssc-chsl-en', icon: '🏢', name: 'SSC CHSL · LDC/JSA', sub: 'English', lang: 'en', pool: 'general', min: 10, wpm: 35, err: 5, backspace: true,
      note: '35 WPM in 10 minutes. Qualifying test.' },
    { id: 'ssc-chsl-hi', icon: '🏢', name: 'SSC CHSL · LDC/JSA', sub: 'हिंदी', lang: 'hi', pool: 'hindi', min: 10, wpm: 30, err: 5, backspace: true,
      note: '30 WPM in 10 minutes, Unicode Mangal.' },
    { id: 'ssc-cgl-dest', icon: '📊', name: 'SSC CGL · DEST', sub: 'Data entry', lang: 'en', pool: 'general', min: 15, kdph: 8000, err: 5, backspace: true,
      note: 'About 2,000 key depressions in 15 minutes (8,000 per hour).' },
    { id: 'ssc-deo-15k', icon: '🖥️', name: 'SSC CHSL · DEO', sub: '15,000 KDPH', lang: 'en', pool: 'general', min: 15, kdph: 15000, err: 5, backspace: true,
      note: 'Data entry operator grade: about 3,750 key depressions in 15 minutes.' },
    { id: 'rrb-ntpc-en', icon: '🚆', name: 'RRB NTPC', sub: 'English', lang: 'en', pool: 'general', min: 10, wpm: 30, err: 5, backspace: false,
      note: '30 WPM in 10 minutes. Backspace is locked, as in the railway test.' },
    { id: 'rrb-ntpc-hi', icon: '🚆', name: 'RRB NTPC', sub: 'हिंदी', lang: 'hi', pool: 'hindi', min: 10, wpm: 25, err: 5, backspace: false,
      note: '25 WPM in 10 minutes. Backspace is locked.' },
    { id: 'sc-jca', icon: '⚖️', name: 'Supreme Court · JCA', sub: 'Legal English', lang: 'en', pool: 'legal', min: 10, wpm: 35, err: 3, backspace: true,
      note: '35 WPM in 10 minutes, mistakes up to 3%. Legal passages.' },
    { id: 'hc-clerk', icon: '🏛️', name: 'High Court clerk', sub: 'Legal English', lang: 'en', pool: 'legal', min: 10, wpm: 35, err: 5, backspace: true,
      note: 'Courts differ: 30 to 40 WPM. Edit the speed to match your notice.' },
    { id: 'cpct-en', icon: '🎓', name: 'MP CPCT', sub: 'English', lang: 'en', pool: 'general', min: 15, wpm: 30, err: 5, backspace: true,
      note: '30 WPM in 15 minutes.' },
    { id: 'cpct-hi', icon: '🎓', name: 'MP CPCT', sub: 'हिंदी', lang: 'hi', pool: 'hindi', min: 15, wpm: 25, err: 5, backspace: true,
      note: '25 WPM in 15 minutes.' },
    { id: 'up-police', icon: '👮', name: 'UP Police · clerk', sub: 'English', lang: 'en', pool: 'general', min: 10, wpm: 30, err: 5, backspace: true,
      note: '30 WPM in 10 minutes.' },
    { id: 'kvs-jsa', icon: '🏫', name: 'KVS / NVS · JSA', sub: 'English', lang: 'en', pool: 'general', min: 10, wpm: 35, err: 5, backspace: true,
      note: '35 WPM in 10 minutes.' },
    { id: 'crpf-hcm', icon: '🛡️', name: 'CRPF / CISF · HCM', sub: 'English', lang: 'en', pool: 'general', min: 10, wpm: 35, err: 5, backspace: true,
      note: '35 WPM in 10 minutes.' },
    { id: 'rsmssb-patwari', icon: '🌾', name: 'Rajasthan · Patwari', sub: 'हिंदी', lang: 'hi', pool: 'hindi', min: 10, wpm: 25, err: 5, backspace: true,
      note: '25 WPM in 10 minutes.' },
    { id: 'rajhc-hi', icon: '🏛️', name: 'Rajasthan High Court', sub: 'हिंदी', lang: 'hi', pool: 'hindi', min: 10, wpm: 25, err: 5, backspace: true,
      note: '25 WPM in 10 minutes.' }
  ];

  var QUICK = [
    { id: 'q1', icon: '⚡', name: '1 minute sprint', sub: 'English', lang: 'en', pool: 'general', min: 1, wpm: 0, err: 100, backspace: true, note: 'Warm up.' },
    { id: 'q3', icon: '⏱️', name: '3 minute test', sub: 'English', lang: 'en', pool: 'general', min: 3, wpm: 0, err: 100, backspace: true, note: 'Short and honest.' },
    { id: 'q5', icon: '🕔', name: '5 minute test', sub: 'English', lang: 'en', pool: 'general', min: 5, wpm: 0, err: 100, backspace: true, note: 'Good for daily practice.' },
    { id: 'q5h', icon: '🪔', name: '5 मिनट टेस्ट', sub: 'हिंदी', lang: 'hi', pool: 'hindi', min: 5, wpm: 0, err: 100, backspace: true, note: 'हिंदी टाइपिंग अभ्यास।' }
  ];

  var GENERAL = [
    'The railway network of the country carries millions of passengers every day and moves a large share of its freight. Trains connect small villages to big cities, and many families depend on them for work, study and medical care. Over the years the network has added new lines, faster engines and cleaner stations. Officers say that regular maintenance and careful planning are the best ways to keep travel safe. Passengers are asked to buy tickets in advance, to keep the platforms clean and to follow the instructions given by the staff.',
    'A good office depends on clear records. Every letter that arrives must be entered in the register, given a number and sent to the right desk. When a file moves from one table to another, the date and the name of the person receiving it should be written down. Clerks who keep neat and accurate records save the department a great deal of time. A missing paper can delay a decision for weeks, so careful habits matter more than speed alone.',
    'Water is one of the most precious resources of any country. Rivers, lakes and wells supply drinking water, and farmers rely on canals and rain to grow their crops. In recent years many towns have faced shortages during the summer months. Local bodies are now building small dams, repairing old tanks and teaching people to use water with care. Simple steps such as fixing a leaking tap or collecting rain from a roof can make a real difference to a neighbourhood.',
    'Digital services have changed the way citizens deal with the government. Forms that once needed a visit to three different offices can now be filled from a phone in a few minutes. Certificates, pension slips and tax receipts can be downloaded at any hour. However, many people in remote areas still need help with these services. Common service centres and trained volunteers play an important part by guiding them patiently, one step at a time.',
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

  var LEGAL = [
    'The petitioner respectfully submits that the order dated the fourteenth day of March was passed without giving him a reasonable opportunity of being heard. It is a settled principle of natural justice that no person shall be condemned unheard. The respondent has not placed on record any document to show that notice was duly served. The petitioner therefore prays that the impugned order be set aside and that the matter be remitted to the competent authority for fresh consideration in accordance with law.',
    'Having heard the learned counsel for both the parties and having perused the record, this Court is of the view that the appeal deserves to be admitted. The delay in filing the appeal has been explained in the affidavit, and the explanation appears to be satisfactory. Notice be issued to the respondents, returnable on the next date of hearing. Until then, the operation of the order under challenge shall remain stayed, and no coercive steps shall be taken against the appellant.',
    'The accused was produced before the Magistrate within twenty-four hours of his arrest, as required by the Constitution. The prosecution has stated that the investigation is still in progress and that certain witnesses are yet to be examined. The defence has argued that the custody of the accused is no longer necessary. After considering the nature of the allegations, the Court grants bail on the condition that the accused shall surrender his passport and appear before the police station every Monday.',
    'The agreement between the parties provides that any dispute arising out of the contract shall first be referred to arbitration. The arbitrator shall be appointed by mutual consent within thirty days of a written request. The seat of arbitration shall be Jaipur, and the proceedings shall be conducted in English. Each party shall bear its own costs unless the arbitrator directs otherwise. The award, once passed, shall be final and binding upon both the parties and their legal representatives.',
    'Under the Right to Information Act, every citizen has the right to request information from a public authority. The authority is required to reply within thirty days, and a reasoned order must be given if the information is refused. An applicant who is not satisfied may file a first appeal before the senior officer and a second appeal before the Information Commission. The Act promotes transparency, reduces corruption and makes officers answerable to the people whom they serve.',
    'The learned trial court recorded the statements of eleven witnesses and examined the documents exhibited by the prosecution. It found that the chain of circumstances was complete and that the evidence led only to the guilt of the accused. The High Court has re-appreciated the evidence and finds no illegality in the judgment. The appeal is accordingly dismissed, and the accused shall surrender before the trial court to serve the remaining part of the sentence.'
  ];

  var HINDI = [
    'भारत एक विशाल देश है जहाँ अनेक भाषाएँ बोली जाती हैं और अनेक त्योहार मनाए जाते हैं। यहाँ के लोग मिल-जुलकर रहते हैं और एक-दूसरे के सुख-दुख में साथ देते हैं। गाँव हो या शहर, हर जगह परिश्रम करने वाले लोग देश को आगे बढ़ा रहे हैं। किसान खेतों में अनाज उगाते हैं, मज़दूर सड़कें और पुल बनाते हैं और शिक्षक बच्चों को पढ़ाते हैं। सबके सहयोग से ही देश की उन्नति संभव है।',
    'पानी हमारे जीवन के लिए बहुत आवश्यक है। नदियाँ, तालाब और कुएँ हमें पीने का पानी देते हैं और खेतों की सिंचाई में भी काम आते हैं। गर्मी के दिनों में कई स्थानों पर पानी की कमी हो जाती है। इसलिए हमें पानी को व्यर्थ नहीं बहाना चाहिए। नल को खुला नहीं छोड़ना चाहिए और वर्षा के जल को इकट्ठा करना चाहिए। थोड़ी-सी सावधानी से हम आने वाली पीढ़ियों के लिए जल बचा सकते हैं।',
    'सरकारी कार्यालयों में प्रत्येक पत्र का रिकॉर्ड रखा जाता है। जब कोई पत्र आता है तो उसे रजिस्टर में दर्ज किया जाता है और संबंधित अधिकारी के पास भेजा जाता है। फ़ाइल जिस मेज़ पर जाती है, उसकी तारीख लिखी जाती है। साफ़ और सही लिखावट से काम जल्दी होता है और गलती की संभावना कम रहती है। एक कुशल लिपिक अपने कार्य को समय पर पूरा करता है और सबके साथ विनम्रता से बात करता है।',
    'शिक्षा से ही मनुष्य का जीवन सुधरता है। पढ़े-लिखे लोग अपने अधिकारों और कर्तव्यों को समझते हैं और सही निर्णय ले पाते हैं। अनेक विद्यालयों में अब कंप्यूटर और पुस्तकालय की सुविधा भी उपलब्ध है। माता-पिता को चाहिए कि वे बच्चों को नियमित रूप से विद्यालय भेजें और उनके अध्ययन में रुचि लें। जो समाज शिक्षा को महत्व देता है, वह निरंतर प्रगति करता है।',
    'वृक्ष हमारे सच्चे मित्र हैं। वे हमें छाया, फल, फूल और शुद्ध हवा देते हैं। वर्षा कराने में भी पेड़ों का बड़ा योगदान होता है। जब जंगल कटते हैं तो मिट्टी बह जाती है और बाढ़ का खतरा बढ़ जाता है। हम सबको चाहिए कि हर वर्ष कम से कम एक पौधा लगाएँ और उसकी देखभाल करें। हरा-भरा वातावरण स्वस्थ जीवन की पहचान है।',
    'डाक विभाग देश के कोने-कोने तक चिट्ठियाँ और पार्सल पहुँचाता है। गाँवों में डाकघर लोगों के लिए बैंक का काम भी करता है। लोग वहाँ अपनी बचत जमा करते हैं और अपने परिजनों को धन भेजते हैं। डाकिया धूप, वर्षा और सर्दी की परवाह किए बिना घर-घर जाता है। उसकी ईमानदारी और परिश्रम के कारण लोगों का उस पर गहरा विश्वास है।',
    'स्वास्थ्य सबसे बड़ा धन है। प्रतिदिन सुबह उठकर टहलना, संतुलित भोजन करना और पर्याप्त नींद लेना अच्छे स्वास्थ्य के लिए आवश्यक है। बीमार होने पर पास के स्वास्थ्य केंद्र में जाकर चिकित्सक की सलाह लेनी चाहिए। टीकाकरण से बच्चों को अनेक रोगों से बचाया जा सकता है। स्वच्छता का ध्यान रखने से भी हम बहुत-सी बीमारियों से दूर रह सकते हैं।',
    'त्योहार हमारे जीवन में उमंग और उत्साह भर देते हैं। दीपावली पर घर रोशनी से जगमगा उठते हैं और बाज़ारों में चहल-पहल बढ़ जाती है। लोग एक-दूसरे को मिठाई बाँटते हैं और शुभकामनाएँ देते हैं। होली रंगों का त्योहार है जो हमें आपसी भेदभाव भुलाकर गले मिलना सिखाता है। ऐसे अवसर हमारी संस्कृति को जीवित रखते हैं और समाज को जोड़ते हैं।'
  ];

  var POOLS = { general: GENERAL, legal: LEGAL, hindi: HINDI };

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

  window.TKData = { EXAMS: EXAMS, QUICK: QUICK, POOLS: POOLS, LESSONS: LESSONS, dataEntry: dataEntry };
})();
