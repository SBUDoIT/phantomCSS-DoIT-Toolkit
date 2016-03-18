/*
	Require and initialise PhantomCSS module
	Paths are relative to CasperJs directory
*/

console.log("it.js running");

var fs = require( 'fs' );
//var path = fs.absolute( fs.workingDirectory + '/phantomcss.js' );
var phantomcss = require( fs.absolute( 'c:/utils/phantomcss/phantomcss.js' ) );
var system = require("system");

var gSheetURL = null;
var gSheet = null;

var rootURL = "http://it.doitsbu.localvm.stonybrook.edu";
var devURL = "http://it.doitsbu.localvm.stonybrook.edu";
var prodURL = "http://it.stonybrook.edu";


//var _baselineImageSuffix = ".prod";
//var _diffImageSuffix = ".dev";

for(i=0; i<system.args.length; i++)
{
	if(system.args[i].indexOf("--gsheetID") === 0)
	{
		gSheet = system.args[i].substring(system.args[i].indexOf("=")+1);
	}
	else if(system.args[i].indexOf("--rootURL") === 0)
	{
		rootURL = system.args[i].substring(system.args[i].indexOf("=")+1);
	}
}

gSheetURL = "https://spreadsheets.google.com/feeds/list/" + gSheet + "/od6/public/basic?alt=json";
console.log("Google Sheet ID: " + gSheet);
console.log("Google Sheet URL: " + gSheetURL);
console.log("Root URL: " + gSheet);

console.log("Google Sheet JSON Requested");
var json_obj = JSON.parse(Get(gSheetURL));
console.log("Google Sheet JSON Receieved");

entries = json_obj.feed.entry;

console.log("There are " + entries.length + " entries in the Google Sheet");

var urls = new Array(entries.length);

var path = '';

for (var i = 0; i < entries.length; i++) {


		path = entries[i]['title']['$t'];
		path = path.substring(path.indexOf("://")+3);
		path = path.substring(path.indexOf("/"));


		var sitePath = new Object();


		sitePath.path = path;
		sitePath.index = i;
		urls[i] = sitePath;


}

casper.test.begin( 'IT VM visual tests', function ( test ) {

		phantomcss.init( {
			rebase: casper.cli.get( "rebase" ),
			// SlimerJS needs explicit knowledge of this Casper, and lots of absolute paths
			casper: casper,
			libraryRoot: fs.absolute( "C:/utils/phantomcss" ),
			screenshotRoot: fs.absolute( fs.workingDirectory + '/it-screenshots' ),
			failedComparisonsRoot: fs.absolute( fs.workingDirectory + '/demo/it-failures' ),
			addLabelToFailedImage: false,
			baselineImageSuffix: ".prod",
			diffImageSuffix: ".dev",
			addIteratorToImage: false,
			failureImageSuffix: ".xFail",
		/*	fileNameGetter: function overide_file_naming(root, fileName){

				var name;

				name = root + fs.separator + fileName;

				if ( _isFile( name + _baselineImageSuffix + '.png' ) ) {
					return name + _diffImageSuffix + '.png';
				} else {
					return name + _baselineImageSuffix + '.png';
				}

			},*/


		} );


		casper.on( 'remote.message', function ( msg ) {
			this.echo( msg );
		} );

		casper.on( 'error', function ( err ) {
			this.die( "PhantomJS has errored: " + err );
		} );

		casper.on( 'resource.error', function ( err ) {
			casper.log( 'Resource load error: ' + err, 'warning' );
		} );


		var viewPortX = 1920;
		var viewPortY = 1080;

		console.log("Starting Screenshot Capture, Viewport: " + viewPortX + ", " + viewPortY);

		casper.start();
		casper.viewport( viewPortX, viewPortY );

	 casper.then(function(){
			 //loop on the array
			 urls.forEach(function(curSitePath){

					 casper.thenOpen(prodURL + curSitePath.path);

					 casper.then( function () {

						 phantomcss.screenshot( '.main-content-wrap', 1000, false, "screenshot-" + curSitePath.index);
					 } );

					 casper.thenOpen(devURL + "" + curSitePath.path);

					 //casper.wait(2000);

						casper.then( function () {
							phantomcss.screenshot( '.main-content-wrap', 1000, false, "screenshot-" + curSitePath.index);
						} );


						casper.then (function () {
							phantomcss.compareFiles("screenshot-" + curSitePath.index + ".prod.png", "screenshot-" + curSitePath.index + ".dev.png");
						});



				});
		});






		casper.then( function now_check_the_screenshots() {
			// compare screenshots
			phantomcss.compareAll();
		} );

		/*
		Casper runs tests
		*/
		casper.run( function () {
			console.log( '\nTHE END.' );
			// phantomcss.getExitStatus() // pass or fail?
			casper.test.done();
		} );
	} );







	function Get(yourUrl){
var Httpreq = new XMLHttpRequest(); // a new request
Httpreq.open("GET",yourUrl,false);
Httpreq.send(null);
return Httpreq.responseText;

    }



		function logElements(element, index, array) {
			console.log('a[' + index + '] = ' + element.path + " ");
		}


		function _isFile( path ) {
			var exists = false;
			try {
				exists = fs.isFile( path );
			} catch ( e ) {
				if ( e.name !== 'NS_ERROR_FILE_TARGET_DOES_NOT_EXIST' && e.name !== 'NS_ERROR_FILE_NOT_FOUND' ) {
					// We weren't expecting this exception
					throw e;
				}
			}
			return exists;
		}
