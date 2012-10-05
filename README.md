# Tumblr Preview

Usage:

	node server.js path/To/Template.html

First-run:

	npm install

Requirements:

* Node
* NPM
* Tumblr themes you want to preview

You need test.json in the directory of your `template.html` file which looks like:

	{
		"tumblr" : "blogwithtestdata.tumblr.com",
		"pages" : [
			{"URL":"/test", "label":"whatever"}
		]
	}


(Customize at will)

Pull requests welcome

:)

