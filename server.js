var	hogan = require('hogan.js'),
	os = require("os"),
	moment = require("moment"),
	http = require("http"),
	sep = require("path").sep,
	libxmljs = require("libxmljs"),
	fs = require('fs');
var express = require('express');
var app = express();

var server = http.createServer(app);
var io = require('socket.io').listen(server, {"log level": 0});

var args = process.argv.splice(2);
var Tinjection = '<script src="/socket.io/socket.io.js"></script><script>var socket = io.connect("http://localhost:3000");socket.on("new", function (data) {console.log("new");document.location.href=document.location;});</script>';

Object.prototype.merge = function(nA){
	for(i in nA){
		this[i] = nA[i];
	}
	return this;
};
Object.prototype.getD = function(key, def){
	if(this[key] != undefined) return this[key];
	return def;
};
Array.prototype.append = function(i){ this[this.length] = i; };

// http://snipplr.com/view/3141/stringreplaceall-method-implementation/
String.prototype.replaceAll = function(pcFrom, pcTo){
	var i = this.toLowerCase().indexOf(pcFrom.toLowerCase());
	var c = this;
 
	while (i > -1){
		c = c.substring(0, i) + pcTo + c.substring(i + pcFrom.length); 
		i = c.toLowerCase().indexOf(pcFrom.toLowerCase());
	}
	return c;
}

if(args.length <= 0){
	console.error("Usage: node server.js pathToTumblrTheme.html");
	process.exit(0);
}

function tumblrToMustache(i){
	// based from http://www.tumblr.com/docs/en/custom_themes
	// may not be 100%
	// returns i but mustachified

	// Basic Variables
	i = i.replaceAll("{block:Title}", "{{# title }}");
	i = i.replaceAll("{Title}", "{{& title }}");
	i = i.replaceAll("{/block:Title}", "{{/ title }}");
	
	i = i.replaceAll("{Description}", "{{& Description }}");
	i = i.replaceAll("{MetaDescription}", "{{ Description }}");
	i = i.replaceAll("{RSS}", "/myfakeRSS");
	i = i.replaceAll("{Favicon}", "/favicon.ico");
	i = i.replaceAll("{CustomCSS}", "{{ CustomCSS }}");
	i = i.replaceAll("{block:PermalinkPage}", "{{# permalinkPage }}");
	i = i.replaceAll("{/block:PermalinkPage}", "{{/ permalinkPage }}");
	i = i.replaceAll("{block:IndexPage}", "{{# indexPage }}");
	i = i.replaceAll("{/block:IndexPage}", "{{/ indexPage }}");
	
	i = i.replaceAll("{block:PostTitle}", "{{# postTitle }}");
	i = i.replaceAll("{PostTitle}", "{{& postTitle }}");
	i = i.replaceAll("{/block:PostTitle}", "{{/ postTitle }}");

	i = i.replaceAll("{block:PostSummary}", "{{# postSummary }}");
	i = i.replaceAll("{PostSummary}", "{{ &postSummary }}");
	i = i.replaceAll("{/block:PostSummary}", "{{/ postSummary }}");

	i = i.replaceAll("{block:TagPage}", "{{# tag }}");
	i = i.replaceAll("{URLSafeTag}", "{{ tag }}");
	i = i.replaceAll("{Tag}", "{{& tag }}");
	i = i.replaceAll("{TagURL}", "/tag/{{ tag }}");
	i = i.replaceAll("{TagURLChrono}", "/tag/{{ tag }}/chrono");
	i = i.replaceAll("{/block:TagPage}", "{{/ tag }}");

	i = i.replaceAll("{block:HasPages}", "{{# has_pages }}");
	i = i.replaceAll("{/block:HasPages}", "{{/ has_pages }}");
	i = i.replaceAll("{block:Pages}", "{{# pages }}");
	i = i.replaceAll("{URL}", "/{{ url }}");
	i = i.replaceAll("{Label}", "{{& label }}");
	i = i.replaceAll("{/block:Pages}", "{{/ pages }}");

	i = i.replaceAll("{SearchQuery}", "{{ &search_query }}");
	i = i.replaceAll("{block:AskEnabled}", "{{# ask_enabled }}");
	i = i.replaceAll("{/block:AskEnabled}", "{{/ ask_enabled }}");

	// Posts
	i = i.replaceAll("{block:Posts}", "{{# posts }}");
	i = i.replaceAll("{/block:Posts}", "{{/ posts }}");
	
	// post type switches
	i = i.replaceAll("{block:Photo}", "{{# is_photo }}{{# Tphotos }}");
	i = i.replaceAll("{/block:Photo}", "{{/ Tphotos }}{{/ is_photo }}");
	i = i.replaceAll("{block:Text}", "{{# is_text }}");
	i = i.replaceAll("{/block:Text}", "{{/ is_text }}");
	i = i.replaceAll("{block:Photoset}", "{{# is_photoset }}");
	i = i.replaceAll("{/block:Photoset}", "{{/ is_photoset }}");
	i = i.replaceAll("{block:Quote}", "{{# is_quote }}");
	i = i.replaceAll("{/block:Quote}", "{{/ is_quote }}");
	i = i.replaceAll("{block:Link}", "{{# is_link }}");
	i = i.replaceAll("{/block:Link}", "{{/ is_link }}");
	i = i.replaceAll("{block:Chat}", "{{# is_chat }}");
	i = i.replaceAll("{/block:Chat}", "{{/ is_chat }}");
	i = i.replaceAll("{block:Audio}", "{{# is_audio }}");
	i = i.replaceAll("{/block:Audio}", "{{/ is_audio }}");
	i = i.replaceAll("{block:Video}", "{{# is_video }}");
	i = i.replaceAll("{/block:Video}", "{{/ is_video }}");
	i = i.replaceAll("{block:Answer}", "{{# is_answer }}");
	i = i.replaceAll("{/block:Answer}", "{{/ is_answer }}");

	// basic post information
	i = i.replaceAll("{PostType}", "{{ type }}");
	i = i.replaceAll("{Permalink}", "{{ permalink }}");
	i = i.replaceAll("{PostNotes}", "{{& post_notes }}");
	i = i.replaceAll("{NoteCount}", "{{ note_count }}");
	i = i.replaceAll("{Body}", "{{& body }}");
	i = i.replaceAll("{TagsAsClasses}", "{{ tags_classes }}");
	i = i.replaceAll("{TimeAgo}", "{{ time_ago }}");
	i = i.replaceAll("{ReblogURL}", "http://tumblr.com/reblog/something/magic/lol");
	
	i = i.replaceAll("{block:RebloggedFrom}", "{{# is_reblog }}");
	i = i.replaceAll("{ReblogParentName}", "{{ reblog_parent }}");
	i = i.replaceAll("{ReblogParentURL}", "{{ reblog_parent_url }}");
	i = i.replaceAll("{ReblogRootName}", "{{ reblog_root }}");
	i = i.replaceAll("{ReblogRootURL}", "{{ reblog_root_url }}");
	i = i.replaceAll("{/block:RebloggedFrom}", "{{/ is_reblog }}");

	i = i.replaceAll("{block:HasTags}", "{{# has_tags }}");
	i = i.replaceAll("{/block:HasTags}", "{{/ has_tags }}");
	i = i.replaceAll("{block:Tags}", "{{# tags }}");
	i = i.replaceAll("{/block:Tags}", "{{/ tags }}");
	
	i = i.replaceAll("{block:HighRes}", "{{# highRes }}");
	i = i.replaceAll("{HighRes}", "{{ &highRes }}");
	i = i.replaceAll("{/block:HighRes}", "{{/ highRes }}");

	i = i.replaceAll("{block:Caption}", "{{# caption }}");
	i = i.replaceAll("{/block:Caption}", "{{/ caption }}");
	i = i.replaceAll("{Caption}", "{{& caption }}");
	
	i = i.replaceAll("{Video-700}", "{{& players.700 }}");
	i = i.replaceAll("{Video-500}", "{{& players.500 }}");
	i = i.replaceAll("{Video-400}", "{{& players.400 }}");
	i = i.replaceAll("{Video-250}", "{{& players.250 }}");

	i = i.replaceAll("{PhotoURL-500}", "{{& 500 }}");
	i = i.replaceAll("{PhotoURL-400}", "{{& 400 }}");
	i = i.replaceAll("{PhotoURL-250}", "{{& 250 }}");
	i = i.replaceAll("{PhotoURL-100}", "{{& 100 }}");
	i = i.replaceAll("{PhotoURL-75sq}", "{{& 75 }}");

	i = i.replaceAll("{DayOfMonth}", "{{ date.day }}");
	i = i.replaceAll("{MonthNumber}", "{{ date.month }}");
	i = i.replaceAll("{Year}", "{{ date.year }}");

	// source
	i = i.replaceAll("{SourceTitle}", "{{ source_title }}");
	i = i.replaceAll("{SourceURL}", "{{ source_url }}");
	i = i.replaceAll("{block:ContentSource}", "{{# source_url }}");
	i = i.replaceAll("{/block:ContentSource}", "{{/ source_url }}");
	i = i.replaceAll("{block:NoSourceLogo}", "{{# source_url }}");
	i = i.replaceAll("{/block:NoSourceLogo}", "{{/ source_url }}");
	i = i.replaceAll("{block:SourceLogo}", "{{# source_logo }}");
	i = i.replaceAll("{/block:SourceLogo}", "{{/ source_logo }}");

	try{
		xml = libxmljs.parseHtmlString(i);
		metas = xml.find("//meta");
		metas.forEach(function(meta){
			n = meta.attr("name").value();
			
			if(n.indexOf("image:") == 0){ In = n.substr( "image:".length).replaceAll(" ", "") + "Image"; }
			else{ In = n.substring( n.indexOf(":")+1 ).replaceAll(" ", ""); }
			v = appconfig.getD("config", {}).getD(In, false) || meta.attr("content").value();
			
			if(v == "" || v == "0"){ // null
				i = i.replaceAll("{block:If" + In + "}", "{{# sfifhjwefbwejbfuiwebj }}"); // p.s I did just hit the keyboard
				i = i.replaceAll("{/block:If" + In + "}", "{{/ sfifhjwefbwejbfuiwebj }}");
				i = i.replaceAll("{block:IfNot" + In + "}", "");
				i = i.replaceAll("{/block:IfNot" + In + "}", "");
			} else{
				i = i.replaceAll("{block:If" + In + "}", "");
				i = i.replaceAll("{/block:If" + In + "}", "");
				i = i.replaceAll("{block:IfNot" + In + "}", "{{# sfifhjwefbwejbfuiwebj }}");
				i = i.replaceAll("{/block:IfNot" + In + "}", "{{/ sfifhjwefbwejbfuiwebj }}");
				i = i.replaceAll("{" + n + "}", v);
			}
		});
	} catch(e){ console.log("meta tags will not work: " + e); }

	return i;
}

// Reads template, outputs Tumblr Blog
function tumblrPage(args, res){
	fs.readFile(thefile, function(err, data){
		try{
			res.send(hogan.compile( tumblrToMustache( data + '' ) ).render(args.merge({
				"title" : tumblrCache.response.blog.title,
				"Description" : tumblrCache.response.blog.description,
				"ask_enabled" : tumblrCache.response.blog.ask,
				"has_pages" : (appconfig.pages.length != 0),
				"pages" : appconfig.pages
			})) + Tinjection);
		} catch(e){ res.end("ouch! that did not work ;__;" + Tinjection); }
	});
}
function dirName(i){
	i = i.split("/");
	i.pop();
	return i.join("/");
}

function sortPosts(posts){
	posts.forEach(function(post){
		post['is_' + post.type] = true;
		time = moment.unix(post.timestamp);
		post['time_ago'] = time.fromNow();
		post['date'] = {
			"day" : time.date(),
			"month" : time.month(),
			"year" : time.year()
		};
		post['tags_classes'] = post.tags.join(" ");

		if(post.player){
			players = {};
			post.player.forEach(function(player){ players[player.width] = player.embed_code; });
			post['players'] = players;
		}
		if(post.photos){
			photos = [];
			post.photos.forEach(function(photo){
				p = {"caption":post.caption,"alt":photo.caption};
				photo.alt_sizes.forEach(function(size){
					p[size.width] = size.url;
				});
				
				if(p['250'] == undefined) p['250'] = p['100']
				if(p['400'] == undefined) p['400'] = p['250']
				if(p['500'] == undefined) p['500'] = p['400']
				photos.append(p);
			});
			post.Tphotos = photos;
		}
		
		post['permalink'] = post.post_url.substr(post.post_url.indexOf("/post"));
	});
	return posts;
}

var thefile = args[0];
console.log("Theme we are using is " + thefile);

app.get("/assets/:file", function(req, res){
	res.sendfile(dirName(thefile) + "/" + req.params.file);
});

app.get("/post/:post*", function(req, res){
	posts = sortPosts(tumblrCache.response.posts);
	posts.forEach(function(p){
		if(p.id == req.params.post){
			post = p;
		}
	});
	
	tumblrPage({
		"permalinkPage" : true,
		"post_notes" : fs.readFileSync("fakeNotes.txt"),
		"posts" : [ post ]
	}, res);
});

app.get("*", function (req, res) {
	tumblrPage({
		"indexPage" : true,
		"posts" : sortPosts(tumblrCache.response.posts)
	}, res);
});
server.listen(3000);

var appconfig = 0;
function load_appconfig(){
	appconfig = JSON.parse(fs.readFileSync(dirName(thefile)+sep+"test.json")+"" );
}
load_appconfig();

if(!fs.existsSync(os.tmpDir() + sep + appconfig.tumblr + "-postcache.json")){
	var http = require("http");
	tumblrCache = "";
	http.get("http://api.tumblr.com/v2/blog/"+appconfig.tumblr+"/posts/?api_key=R6L6HL6PmZT56qubaxqwJjwvf9M7gVA80uCxNNZEvy7q4nkxnw", function(res){
		res.on('data', function (chunk) {
			tumblrCache += chunk;
		});
		res.on("end", function(){
			fs.writeFileSync(os.tmpDir() + sep + appconfig.tumblr  + "-postcache.json", tumblrCache);
			tumblrCache = JSON.parse(tumblrCache);
			console.log("Data OK");
		});
	});
} else{
	tumblrCache = JSON.parse(fs.readFileSync(os.tmpDir() + sep + appconfig.tumblr + "-postcache.json")+"" );
	console.log("Data OK (cached)");
}

function send_change(){
	console.log("Theme updated");
	load_appconfig();
	io.sockets.emit("new", {});
	watch();
};

watchT = undefined;

function watch(){
	fs.watch(thefile, function (event, filename) {
		if(event == "change"){
			if(watchT != undefined) clearTimeout(watchT);
			watchT = setTimeout(send_change, 400);
		}
	});
}
watch();

app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(function(err, req, res, next){
		console.error(err.stack);
		res.send(500, 'Something broke!');
	});
});

console.log('Server running at http://127.0.0.1:3000/');
io.sockets.emit("new", {}); // reload old clients
