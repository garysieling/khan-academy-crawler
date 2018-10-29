const fs = require('fs');
const _ = require('lodash');
const data = JSON.parse(fs.readFileSync('topics.json'));

// youtube_id, description, title, 
//
// subtopic, list of videos
// domain_slug
//childrenx`.children[0].children

const counts = {};
const youtube = [];
const topicMapping = {};

const topicReplacements = {
  "High school biology": "Biology",
  "Algebra I (Eureka Math/EngageNY)": "Algebra",
  "Geometry (Eureka Math/EngageNY)": "Geometry",
  "Algebra II (Eureka Math/EngageNY)": "Algebra",
  "Precalculus (Eureka Math/EngageNY)": "Precalculus",
  "Statistics and probability": "Statistics",
  "High school statistics": "Statistics",
  "Algebra (all content)": "Algebra",
  "Geometry (all content)": "Geometry",
  "Calculus, all content (2017 edition)": "Calculus",
  "Differential Calculus (2017 edition)": "Calculus",
  "Integral Calculus (2017 edition)": "Calculus",
  "Calculus AB (2017 edition)": "Calculus",
  "Calculus BC (2017 edition)": "Calculus",
  "Calculus AB": "Calculus",
  "Calculus BC": "Calculus",
  "US history": "US History",
  "Physics 1": "Physics",
  "Physics 2": "Physics",
  "Algebra 1": "Algebra",
  "Algebra 2": "Algebra",
  "Class 10 Physics (India)": "Physics",
  "Class 11 Physics (India)": "Physics",
  "Class 12 Physics (India)": "Physics",
  "Arithmetic (all content)": "Arithmetic",
  "Special topics in art history": "Art History",
  "Art history basics": "Art History",
  "Basic geometry": "Geometry",
  "Algebra basics": "Algebra",
  "High school geometry": "Geometry",
  "Calculus 1": "Calculus",
  "Calculus 2": "Calculus",
  "Algebra I": "Algebra",
  "Algebra II": "Algebra",
}

function processChildren(data, topics) {
  //console.log(data.length);
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    let nextTopics = topics.slice()
    if (row.translated_title) {
      if (['Test prep', 
	   'Partner content', 
	   'Talks and interviews',
           'College, careers, and more',
	   'Resources',
	   'Class 11 Physics (India) - Hindi',
	   'Class 8 (India)  ',
	   'Math for fun and glory',
	   "3rd grade foundations (Eureka Math/EngageNY) ", 
           "4th grade foundations (Eureka Math/EngageNY) ",
           "5th grade foundations (Eureka Math/EngageNY) ",
           "6th grade foundations (Eureka Math/EngageNY)",
           "7th grade foundations (Eureka Math/EngageNY)",
           "8th grade foundations (Eureka Math/EngageNY)",
	   'Mathematics I',
	   'Mathematics II',
	   'Mathematics III',
	   'Hour of Code',
           "6th grade (Ontario)",
           "6th grade (WNCP)",
           "6th grade (Illustrative Mathematics)",
           "7th grade (Illustrative Mathematics)",
           "8th grade (Illustrative Mathematics)",
           "3rd grade (Eureka Math/EngageNY)",
           "4th grade (Eureka Math/EngageNY)",
           "5th grade (Eureka Math/EngageNY)",
           "6th grade (Eureka Math/EngageNY)",
           "7th grade (Eureka Math/EngageNY)",
           "8th grade (Eureka Math/EngageNY)",
           "Class 5 math (India)",
           "Class 6 math (India) ",
           "Class 7 math (India)",
           "Class 8 math (India)",
           "Class 9 math (India)",
           "Class 10 math (India)",
           "Class 11 math (India)",
           "Class 12 math (India)",
           "Class 6 Math (India) - Hindi ",
           "Class 7 Math (India) - Hindi",
           "Class 8 Math (India) - Hindi",
           "Class 9 Math (India) - Hindi",
           "Class 10 Math (India) - Hindi",
           "Class 11 Math (India) - Hindi",
           "Early math",
           "Kindergarten",
           "1st grade",
           "2nd grade",
           "3rd grade",
           "4th grade",
           "5th grade",
           "6th grade",
           "7th grade",
           "8th grade",
	   "kMAP"
          ].includes(row.translated_title)) {
	      console.log(row.translated_title)
	continue;
      }

      if (nextTopics.length <= 2) {
        let topic = row.translated_title;
	if (topic.startsWith('AP®︎')) {
	  topic = topic.substring('AP®︎'.length + 1);
	}

	if (topicReplacements[topic]) {
	  topic = topicReplacements[topic];
	}

        nextTopics.push(topic);
      }
    }

    if (row.youtube_id) {
      for (let j = 0; j < nextTopics.length; j++) {
        const key = nextTopics.slice(0, j).join('/');
	counts[key] = (counts[key] || 0) + 1;
      }
	
      //console.log(row.youtube_id + ', ' + nextTopics.join(', '));
      topicMapping[row.youtube_id] = nextTopics;
      youtube.push(row.youtube_id);
    }

    if (row.children) {
      processChildren(row.children, nextTopics);
    }
  }
}

processChildren(data.children, []);

console.log(JSON.stringify(counts, null, 2));

const dataDir = ".";
const ffmpegDir = "/usr/local/bin/ffmpeg";
let partitions = 10;
const videos = _.uniq(youtube);

script = "";

for (let i = 0; i < partitions; i++) {
  let file = `youtube${i}.sh`;

  fs.writeFileSync(
    file,
    `pmset noidle &
PMSETPID=$!

` + videos.filter(
      (id, idx) => !fs.existsSync(`./data/${id}/${id}.info.json`) &&
	           idx % partitions === i
    ).map(
      (id) => `./bin/youtube-dl \
      --ffmpeg-location ${ffmpegDir} \
      --skip-download \
      --write-sub --write-auto-sub --sub-format vtt \
      --ignore-errors --youtube-skip-dash-manifest \
      -o '${dataDir}/data/%(id)s/%(id)s.%(ext)s' --write-info-json \
      --no-call-home \
      "https://www.youtube.com/watch?v=${id}"
	`
    ).join("\n") + `
	  kill $PMSETPID
	  `
  );

  script = script + "nohup ./" + file + " & \n";
}

fs.writeFileSync("youtube-partitions.sh", script);

const srt = require('srt-to-text');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

const lines =
  fs.readdirSync('data').filter(
    (id) => fs.existsSync('data/' + id + '/' + id + '.en.vtt') 
  ).filter(
    (id) => !!topicMapping[id]
  ).map(
    (id) => [id, fs.readFileSync('data/' + id + '/' + id + '.en.vtt', 'utf-8')]
  ).map(
    ([id, text]) => [
        id, 
        topicMapping[id].map(
	  (_, i) => topicMapping[id].slice(0, i + 1).join('__')
            ).map(
              (_) => "__label__" + _.replace(/[ ()-/\:.]/g, '_')
            ), 
  	    tokenizer.tokenize(
              srt.parse(text).replace(/[[]\w+[\]]/g, '')
            ).join(' ')
    ]
  ).map(
    ([id, labels, text]) => labels.join(' ') + ' ' + text
  );

const randomized = _.shuffle(lines);

const indexToSplit = 0.25 * randomized.length;
const test = randomized.slice(0, indexToSplit);
const train = randomized.slice(indexToSplit + 1);

fs.writeFileSync('test.txt', test.join("\n"));
fs.writeFileSync('train.txt', train.join("\n"));


