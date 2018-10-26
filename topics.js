const fs = require('fs');
const data = JSON.parse(fs.readFileSync('topics.json'));

// youtube_id, description, title, 
//
// subtopic, list of videos
// domain_slug
//childrenx`.children[0].children

const counts = {};

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
	   'Resources'
          ].includes(row.translated_title)) {
	return;
      }

      if (nextTopics.length <= 2) {
        nextTopics.push(row.translated_title);
      }
    }

    if (row.youtube_id) {
      for (let j = 0; j < nextTopics.length; j++) {
        const key = nextTopics.slice(0, j).join('/');
	counts[key] = (counts[key] || 0) + 1;
      }
      console.log(row.youtube_id + ', ' + nextTopics.join(', '));
    }

    if (row.children) {
      processChildren(row.children, nextTopics);
    }
  }
}

processChildren(data.children, []);

console.log(JSON.stringify(counts, null, 2));
