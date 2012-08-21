///////////////////////////////////////////////////////////////////////
//                StyleSheet Convenience Class

var styles = {
	sheet: undefined,	
	rules: {} ,
	getStyleSheet: function (unique_title) { 
		var i;
	  for(i=0; i<document.styleSheets.length; i++) {
	    if(document.styleSheets[i].title == unique_title) {
	      this.sheet = document.styleSheets[i]; }}
		if ( this.sheet != undefined ) {
			this.refreshRules(); }
		return this;
	},
	refreshRules: function ()
	{
		 var x,cr = this.sheet.cssRules;
		 for ( x in cr ){
			 this.rules[cr[x].selectorText]=x;}
		 this.rules.length = cr.length;
	},
	getRule: function (selector)
	{
		var ret = [] ;
		if ( this.rules.length != this.sheet.cssRules.length ) {
			this.refreshRules(); }
		if ( this.rules[selector] != undefined ) {
			ret.push(this.sheet.cssRules[this.rules[selector]]); }
		/*/for ( var x in cr )
		{
			if ( cr[x].selectorText != selector && cr[x].selectorText.match( selector ) )
				console.log( cr[x].selectorText );
			if ( cr[x].selectorText != undefined && cr[x].selectorText == selector )
				ret.push(cr[x]);
		} // */
		return ret;
	},
	setRule: function (selector,style)
	{
		var x,cr = this.sheet.cssRules;
		for ( x in cr )
		{
			if ( cr[x].selectorText == selector )
			{
				this.sheet.deleteRule(x);
				this.sheet.insertRule(selector+'{'+style+'}',x);
			}
		}
		return this;
	},
	addRule: function (selector, style )
	{
		if ( this.rules[selector] != undefined ) 
			return ; 
		this.sheet.insertRule(selector+'{'+style+'}',this.sheet.cssRules.length);
		this.rules[selector]=this.sheet.cssRules.length;
	},
	updateRule: function ( selector, prop_erties )
	{
		var props,x,r,i,rs = this.getRule( selector );
		if ( rs.length === 0 )
		{
			this.addRule ( selector, '' );
			rs = this.getRule ( selector );
			if ( rs.length < 1 ) 
				return; 
		}
		props = prop_erties;
		if ( typeof props !== "object" )
		{
			props = new Object() ;
			r = prop_erties.split(';');
			for ( x in r )
			{
				var parts = r[x].split(':',2);
				props[parts[0]] = parts[1];
			}
		}
		for ( i in rs )
		{
			if ( rs[i] === undefined ) 
				continue; 
			for ( x in props )
			{
				if ( props[x] === null || props[x].length == 0 ) {
					rs[i].style.removeProperty(x); }
				else {
					rs[i].style.setProperty( x, String(props[x]), null ); }
			}
		}
	}
};

function randomColor ()
{
	var s = '#';
	for ( var i=0; i<6; i++)
		s = s + Number( Math.round( Math.random() * 15 ) ).toString(16);
	return s;
}

function RGBtoHex ( c )
{
	var pad = function (n) { return n<16 ? '0'+Number(n).toString(16) : Number(n).toString(16) };
	var numbers = String(c).match(/([0-9]+),\s*([0-9]+),\s*([0-9]+)/);
	return '#' + pad ( numbers[1] ) + pad ( numbers[2] ) + pad ( numbers[3] ) ;
}

///////////////////////////////////////////////////////////////////////
//               build calendar style sheet 

function calstyle ()
{
	var calcolors = '';
	var cals = $(document).caldav('calendars');
	for ( var i=0;i<cals.length;i++)
	{
		if ( ! String(cals[i].color).match ( /^#[0-9a-fA-F]+/ ) )
			cals[i].color = defaultColors[(i%6)] ;
		calcolors = calcolors + ' .calendar' + i + ' { color: ' + cals[i].color + '; border-right-color: ' + cals[i].color + ';   }' ;
		calcolors += '.calendar' + i + ':hover { background-color: ' + cals[i].color + '; }' ;
		calcolors += '.calendar' + i + 'bg { color: white; background-color: ' + cals[i].color + '; border-right-color: ' + cals[i].color + '; }' ;
	}
	
	//$('.caldialog .databool').live('click',function(e){$(this).toggleClass('boolselected');});

	var startt = settings.start.getLongMinutes();
	var endt = settings.end.getLongMinutes();
	var wvs = '';
	for ( var i=startt;i<=endt;i+=100)
	{
		var z = 100*((i-startt)/(endt-startt)); 
		wvs = wvs + '.weekview .time'+i + ' { position: absolute; top:' + z + '% }' + "\n";
		z = 100*((i-startt+25)/(endt-startt+100)); 
		wvs = wvs + '.weekview .time'+(i+15) + ' { position: absolute; top:' + z + '% }' + "\n";
		z = 100*((i-startt+50)/(endt-startt+100)); 
		wvs = wvs + '.weekview .time'+(i+30) + ' { position: absolute; top:' + z + '% }' + "\n";
		z = 100*((i-startt+75)/(endt-startt+100)); 
		wvs = wvs + '.weekview .time'+(i+45) + ' { position: absolute; top:' + z + '% }' + "\n";
	}
	for ( var i=endt;i<=2400;i+=100)
	{
		if ( i > endt )
			wvs = wvs + '.weekview .time'+i + ' { position: absolute; bottom: 0 }' + "\n";
		wvs = wvs + '.weekview .time'+(i+15) + ' { position: absolute; bottom: 0 }' + "\n";
		wvs = wvs + '.weekview .time'+(i+30) + ' { position: absolute; bottom: 0 }' + "\n";
		wvs = wvs + '.weekview .time'+(i+45) + ' { position: absolute; bottom: 0 }' + "\n";
	}
	var pct = 100/( ( ( (endt)-startt ) / 100 ) * 4 ) ;
	var c = 0;
	for ( var i=15;i<=(endt-startt);i+=15)
	{
		c+=pct;
		wvs = wvs + '.weekview .week .day .eventlist li.event[data-duration="'+i+'"] {height:'+ c + '%; max-height:100% }' + "\n";
	}

	var cs = '<style title="calstyle">' + "\n" +
	"body > .hourswrapper { display: none; } \n" +
	'#calwrap { font-family: Helvetica, sans-serif;  clear: both; clear-after:bottom; position: absolute; top:0; left: 0; width: 100%; height: 100%; overflow: hidden; background-color: #FFF; '+
		'/* display: -webkit-box;display: -moz-box;display: box; -webkit-box-orient: horizontal; -webkit-box-pack: justify; -moz-box-orient: horizontal; -moz-box-pack: justify; box-orient: horizontal; box-pack: justify; */ }' + "\n" + 
	calcolors +
	
	'#caldialog {position:absolute; z-index: 100; top: 10em; left: 5em; width: 350px; height: 300px; border:1px solid #AAA; background:#FFF; overflow: visible; font-size: 11pt; '+
		'-moz-border-radius:5px; -webkit-border-radius:5px; border-radius:5px;  -moz-box-shadow: 3px 3px 10px #888; -webkit-box-shadow: 3px 3px 10px #888; box-shadow: 3px 3px 10px #888; '+
		'-webkit-transform: translate(13px,-20px); -moz-transform: translate(13px,-20px); transform: translate(13px,-20px);} ' + "\n" +	

	'#calcenter { float: left; /*-moz-box-flex: 3; -webkit-box-flex: 3; box-flex: 3;*/ height: 100%; width: 70%; overflow: hidden; }' + "\n" +
	'#calh { width: 100%; table-layout: fixed; overflow-x: hidden; border-spacing:0; padding:0; margin:0; border:0; color: #666; padding-right:1px; font-size: 80%; }' + "\n" + 
	"#calh .days td { display: table-cell; float: none; }\n" + 
	'#gototoday { position: absolute; left: 0em; font-size: 12pt; width: 4em;}' + "\n" +
	'#weekview { position: absolute; left: 7em; font-size: 12pt; width: 4em;}' + "\n" +
	'#refresh { position: absolute; left: 14em; font-size: 12pt; font-face: Helvetica; font-weight: bold; width: 1em; padding: 0.1em .25em 0.1em .25em; height: 1.19em; }' + "\n" +
	'#logout { position: absolute; right: 4em; font-size: 12pt; width: 4em;}' + "\n" +
	'#calt { width:100%; border-spacing:0; padding:0; margin:0; border:0; table-layout: fixed; }' + "\n" + 
	'#calsidebar { float: left; /* -moz-box-flex: 1; -webkit-box-flex: 1; box-flex: 1; */ position: relative; width: 15%; min-height: 6em; height: 100%; background-color: #EFEFFF; '+
		'background-image: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAABCAYAAAAW/mTzAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAUSURBVAiZY/z06dN/BiTAy8vLCABHcQP/jGwD2gAAAABJRU5ErkJggg==\'); '+
		'border-right: 1px solid #AAA; overflow: hidden; margin-right: -1px; }' + "\n" +
	'#calsidebar * { resize: none; } ' + "\n" +
	'#calsidebar > .sidetitle { font-size: 200%; font-weight: lighter; border: none !important; border-bottom:1px solid #AAA !important; text-align: center; padding: .15em 0 .6em; margin:0;}' + "\n" +
	'#callist { position: relative; display: block; margin: 0; padding: 0px; list-style-type: none; overflow-x: hidden; overflow-y: scroll; padding-top: 1em; margin-right: -1.2em; max-height: 100%; } ' + "\n" +
	'#callist > li { margin-left: 0; padding: 0;  padding-bottom: .5em; -webkit-transition-property: all; -webkit-transition-duration: 1.4s;  -moz-transition-property: all; -moz-transition-duration: 1.4s; transition-property: all; transition-duration: 1.4s;  } ' + "\n" +
	'#callist > li:last-child { margin-bottom: 2em; } ' + "\n" +
	'#callist > li > span:hover:after { content: "edit"; position: absolute: right: 0; float: right; display: block; width: 3.5em; } ' + "\n" +
	'#callist > li > span { color: #666; margin:0;padding:0;padding-left: 12px; display: block; width: 100%; position: relative; font-size: 9pt; letter-spacing: -0.01em; text-transform: uppercase; '+
		'-webkit-transition-property: all; -webkit-transition-duration: .4s; -moz-transition-property: all; -moz-transition-duration: .4s; transition-property: all; transition-duration: .4s; } ' + "\n" +
	//'#calsidebar > ul > li.closed > span   { color: #888; } ' + "\n" +
	'#callist > li.closed > ul  { height: 0px;   } ' + "\n" +
	'#callist > li > span:before   { content: ""; display: block; position: absolute; left: 1px; width:0; height:0; border-color: #666 transparent transparent transparent; border-style: solid; border-width: 7px 4px 4px 4px; '+
		'-webkit-transition-property: all; -webkit-transition-duration: .4s; -moz-transition-property: all; -moz-transition-duration: .4s; -o-transition-property: all; -o-transition-duration: .4s; transition-property: all; transition-duration: .4s; '+
		'-webkit-transform: translate(0px, 3px) rotate(0deg) ; -moz-transform: translate(0px,3px) rotate(0deg) ; transform: rotate(0deg) ; } ' + "\n" +
	'#callist > li.closed > span:before { border-color: #666 transparent transparent transparent; -webkit-transform: translate(3px, 1px) rotate(-90deg) ; -moz-transform: translate(3px, 1px) rotate(-90deg) ;  -o-transform: translate(3px, -1px) rotate(-90deg) ; -ms-transform: translate(3px, 1px) rotate(-90deg); transform: translate(3px, 1px) rotate(-90deg) ; } ' + "\n" +
	'#callist li:hover { background: none; } ' + "\n" +
	'#callist > li > ul { margin-left: 0em; padding-left: 0; overflow-y: hidden; resize: none; -webkit-transition-property: height; -webkit-transition-duration: .4s; '+
		'-moz-transition-property: all; -moz-transition-duration: .4s; transition-property: all; transition-duration: .4s;  } ' + "\n" +
	'#callist > li > ul > li { margin-left: 0; padding-left: 1.5em; list-style-type: none; padding-top: .12em; padding-bottom: .12em; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; } ' + "\n" +
	'#callist > li > ul > li.selected { background: #CCD; background: -moz-linear-gradient(top, #CCD 0%, #AAA 100%); background: -webkit-gradient(linear, left top, left bottom, from(#CCD), to(#AAA)); background: -webkit-linear-gradient(top, #CCD 0%, #AAA 100%); background: linear-gradient(top, #CCD 0%, #AAA 100%); text-shadow: 0 1px 1px rgba(255,255,255,0.75), 0 -1px 1px rgba(0,0,0,0.1); } ' + "\n" +
	'#invitewrap { margin: 0; padding: 0px; overflow: hidden; position: relative; width: 100%; max-height: 14em; position: absolute; bottom: 1em; padding-top: 1.25em; padding-bottom: 1.2em; } ' + "\n" +	
	'#calinvites { margin: 0; padding: 0px; list-style-type: none; overflow-x: hidden; overflow-y: scroll; width: 100%; bottom: .1em; padding-bottom: 1em; padding-right: 16px; max-height: 100%; min-height: 5em; } ' + "\n" +	
	'#calinvites li { margin-right: -16px; padding: 4px; } ' + "\n" +
	'#calinvites li:nth-child(1) { padding: 1px; } ' + "\n" +
	'#calinvites li:nth-child(2) { margin-top: 4px; } ' + "\n" +
	'#calinvites li.event::after { content: "'+ui.inviteFrom+' " attr(data-from); display: block; position: relative; font-size: 90%; color: #444; } ' + "\n" +
	'#calinvites li.event:hover { color: black; background: #DDD; } ' + "\n" +
	'#calinvites li.header { display: block; font-size: 120%; border-bottom: 1px solid #AAA; background: #DDD; position: absolute; z-index: 100; width: 100%; top: 0; } ' + "\n" +
	'#calinvites li.header:hover { background: #DDD; } ' + "\n" +
	'#calinvites li.header:nth-last-child(1) { display: none; } ' + "\n" +
//	'#calinvites li:first-child::before { content: "'+ui.invitations+' "; display: block; position: relative; height: 1px; overflow: visible; baseline-shift: -1em; font-size: 120%; margin-top: -1em; border-bottom: 1px solid #AAA; } ' + "\n" +
//	'#calinvites li:first-child:hover { background: none; } ' + "\n" +
	'#calsidebar > .calfooter { position: absolute; bottom:0; padding: 0; margin: 0; width: 100%; /* display: -webkit-box;display: -moz-box;display: box; -webkit-box-orient: horizontal; -webkit-box-pack: justify; -moz-box-orient: horizontal; -moz-box-pack: justify; box-orient: horizontal; box-pack: justify; */ max-height: 1.25em;  overflow: hidden; }' + "\n" +
	'.calfooter > DIV { overflow: hidden; -webkit-transition-property: all; -webkit-transition-duration: .2s; -moz-transition-property: all; -moz-transition-duration: .2s; transition-property: all; transition-duration: .2s; }' + "\n" +
	'.calfooter > DIV:hover { -moz-box-shadow: inset 0px 0px 3px 0px #aaa; -webkit-box-shadow: inset 0px 0px 3px 0px #aaa; box-shadow: inset 0px 0px 3px 0px #aaa;} ' + "\n" +
	
	'#caltodo { position: relative; float: right;  width: 15%;  overflow-x: hidden; min-height: 6em; height: 100%; background-color: #EFEFFF; border-left: 1px solid #AAA; margin-left: -1px; margin-right: 0; '+
		'background-image: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAABCAYAAAAW/mTzAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAUSURBVAiZY/z06dN/BiTAy8vLCABHcQP/jGwD2gAAAABJRU5ErkJggg==\'); }' + "\n" +
	'#caltodo > .sidetitle { font-size: 200%; font-weight: lighter; border-bottom:1px solid #AAA; text-align: center; padding: .15em 0 .6em; margin:0;}' + "\n" +
	'#caltodo > .sidetitle div.button { display: block; font-size: 50%; font-weight: lighter; border: none !important; text-align: center; width: 100%; margin:0;}' + "\n" +
	'#caltodo > .sidetitle span { display: block; float: left; width: 50%; margin:-1px; padding:0; position: relative; bottom: -0.43em;}' + "\n" +
	'#caltodo ul { position: absolute; top: 3.6em; bottom: 0; overflow-x: hidden; overflow-y: auto; margin: 0; padding: 0px; list-style: none; width: 100%; } ' + "\n" +
	'#caltodo ul li { overflow: hidden; display: block; margin: 0; padding: 0; padding-left: 0; margin-bottom: .75em; line-height: 1.2em; list-style-type: none; -webkit-transition-property: all; -webkit-transition-duration: .2s; -moz-transition-property: all; -moz-transition-duration: .2s; transition-property: all; transition-duration: .2s; } ' + "\n" +
	'#caltodo ul li.hidden { margin-bottom: 0px; padding-top: 0px; padding-bottom: 0px; height: 0px; opacity: 1.0; } ' + "\n" +
	
	'li[priority="1"]::after { display: block; position: relative; left: 100%; width: .7em; margin-left: -0.7em; top: -0.85em; height: 0em; border-top: .4em solid #444; border-bottom: .4em solid #444; content: " " } ' +
	'li[priority="1"]::before { display: block; position: absolute; left: 100%; width: .7em; margin-left: -0.7em; margin-top: -0.05em; height: .2em; border-top: .4em solid #444; content: " " } ' +

	'li[priority="2"]::after { display: block; position: relative; left: 100%; width: .7em; margin-left: -0.7em; top: -0.85em; height: 0em; border-top: .4em solid #444; border-bottom: .4em solid #444; content: " " } ' +
	'li[priority="2"]::before { display: block; position: absolute; left: 100%; width: .7em; margin-left: -0.7em; margin-top: -0.05em; height: .2em; border-top: .4em solid #444; content: " " } ' +

	'li[priority="3"]::after { display: block; position: relative; left: 100%; width: .7em; margin-left: -0.7em; top: -0.85em; height: 0em; border-top: .4em solid #444; border-bottom: .4em solid #444; content: " " } ' +
	'li[priority="3"]::before { display: block; position: absolute; left: 100%; width: .7em; margin-left: -0.7em; margin-top: -0.05em; height: .2em; border-top: .4em solid #444; content: " " } ' +

	'li[priority="4"]::after { display: block; position: relative; left: 100%; width: .7em; margin-left: -0.7em; top: -0.85em; height: 0em; border-top: .4em solid #444; border-bottom: .4em solid #444; content: " " } ' +
	'li[priority="4"]::before { display: block; position: absolute; left: 100%; width: .7em; margin-left: -0.7em; margin-top: -0.05em; height: .2em; border-top: .4em solid #444; content: " " } ' +

	'li[priority="5"]::after { display: block; position: relative; left: 100%; width: .7em; margin-left: -0.7em; top: -0.85em; height: 0em; border-top: .4em solid #444; border-bottom: .4em solid #444; content: " " } ' +
	'li[priority="5"]::before { display: block; position: absolute; left: 100%; width: .7em; margin-left: -0.7em; margin-top: -0.05em; height: .2em; border-top: .4em solid #AAA; content: " " } ' +

	'li[priority="6"]::after { display: block; position: relative; left: 100%; width: .7em; margin-left: -0.7em; top: -0.85em; height: 0em; border-top: .4em solid #AAA; border-bottom: .4em solid #444; content: " " } ' +
	'li[priority="6"]::before { display: block; position: absolute; left: 100%; width: .7em; margin-left: -0.7em; margin-top: -0.05em; height: .2em; border-top: .4em solid #AAA; content: " " } ' +

	'li[priority="7"]::after { display: block; position: relative; left: 100%; width: .7em; margin-left: -0.7em; top: -0.85em; height: 0em; border-top: .4em solid #AAA; border-bottom: .4em solid #444; content: " " } ' +
	'li[priority="7"]::before { display: block; position: absolute; left: 100%; width: .7em; margin-left: -0.7em; margin-top: -0.05em; height: .2em; border-top: .4em solid #AAA; content: " " } ' +

	'li[priority="8"]::after { display: block; position: relative; left: 100%; width: .7em; margin-left: -0.7em; top: -0.85em; height: 0em; border-top: .4em solid #AAA; border-bottom: .4em solid #444; content: " " } ' +
	'li[priority="8"]::before { display: block; position: absolute; left: 100%; width: .7em; margin-left: -0.7em; margin-top: -0.05em; height: .2em; border-top: .4em solid #AAA; content: " " } ' +

	'li[priority="9"]::after { display: block; position: relative; left: 100%; width: .7em; margin-left: -0.7em; top: -0.85em; height: 0em; border-top: .4em solid #AAA; border-bottom: .4em solid #444; content: " " } ' +
	'li[priority="9"]::before { display: block; position: absolute; left: 100%; width: .7em; margin-left: -0.7em; margin-top: -0.05em; height: .2em; border-top: .4em solid #AAA; content: " " } ' +

	'#wcal { width: 100%; overflow: scroll; float: left; overflow-x: hidden; height:24em; border-spacing:0; padding:0; margin:0; margin-left: 0.95em; margin-right: -9px; border:0; border-top: 1px solid #AAA; border-left: 1px solid #AAA; }' + "\n" + 


	'.highlighted { outline: 1px dotted #888 ; -moz-box-shadow: 2px 2px 4px #888; -webkit-box-shadow: 2px 2px 4px #888; box-shadow: 2px 2px 4px #888;  }' + "\n" +

	'.calpopup { overflow: auto; } ' + "\n" +
	'.calpopup * { overflow: hidden; } ' + "\n" +
	'.calpopup ul { margin:0; padding:1em; max-width: 100%; overflow: hidden; }' + "\n" +
	'.calpopup li { margin:0; padding:0; list-style: none; list-style-type: none; font-size:9pt; }' + "\n" +
	'.calpopup > ul > li { clear: both; min-height: 1.8em; }' + "\n" +
	'.calpopup > ul > li:first-child span:first-child { display: none; }' + "\n" +
	'.calpopup > ul > li:first-child span { font-size: 14pt; color: #004; padding-bottom: .75em; margin-left: 0; }' + "\n" +
	'.calpopup .label { margin:0; padding:0; display: block; float: left; width: 5.5em; text-align: right; color: #777; font-weight: bold; padding-right: 3px; margin-top: 6px;clear: left; position: absolute; }' + "\n" +
	'.calpopup .value { resize: none; outline: none; margin:0; padding:0; padding-right: 2px; padding-left: 4px; min-width: 3em; min-height: 1em; display: block; float: left; padding-top: 6px; padding-bottom: 2px; margin-left: 5.5em; }' + "\n" +
  '.calpopup .value .value { margin-left: 0;  } ' + "\n" + 
  '.calpopup .value p:first-child { display: inline; }' + "\n" +
  '.calpopup .value p { padding: 0; margin: 0; }' + "\n" +
	'.calpopup .value.text:hover { outline: 1px solid #AAA; resize: both;}' + "\n" +
	'.calpopup .value:focus { outline: none; -moz-box-shadow: 1px 1px 3px #888; -webkit-box-shadow: 1px 1px 3px #888; box-shadow: 1px 1px 3px #888; resize: none; width: auto;}' + "\n" +
	'.calpopup .value.text:focus:hover { resize:both; }' + "\n" +
	'.calpopup .attendee.accepted:before { content: "\\2713"; color: white; background-color: green; -moz-border-radius:.55em; -webkit-border-radius:.5em; border-radius:.5em; display: inline-block; width: 1em; height: 1em; margin:.2em; text-align: center; padding: .05em ; font-weight: bold; } \n' + 
	'.calpopup .attendee.tentative:before { content: "?"; color: white; background-color: gold; -moz-border-radius:.55em; -webkit-border-radius:.5em; border-radius:.5em; display: inline-block; width: 1em; height: 1em; margin:.2em; text-align: center; padding: .05em ; font-weight: bold; } \n' + 
	'.calpopup .attendee.needs-action:before { content: "!"; color: white; background-color: grey; -moz-border-radius:.55em; -webkit-border-radius:.5em; border-radius:.5em; display: inline-block; width: 1em; height: 1em; margin:.2em; text-align: center; padding: .05em ; font-weight: bold; } \n' + 
	'.calpopup .attendee.declined:before { content: "\\2717"; color: white; background-color: red; -moz-border-radius:.55em; -webkit-border-radius:.5em; border-radius:.5em; display: inline-block; width: 1em; height: 1em; margin:.2em; text-align: center; padding: .05em ; font-weight: bold; } \n' + 
	'.calpopup .recurrence { resize: none; outline: none; margin:0; padding:0; padding-right: 2px; padding-left: 4px; min-width: 3em; min-height: 1em; display: block; float: left; margin-top: 6px; margin-bottom: 2px; max-height: 1em; position: absolute; left: 7.5em; overflow: hidden; }' + "\n" +
	'.calpopup .recurrence:hover,.calpopup .recurrence.focus { max-height: none; background: #E3E3E3; -moz-box-shadow: 1px 1px 3px #888; -webkit-box-shadow: 1px 1px 3px #888; box-shadow: 1px 1px 3px #888; overflow: visible; z-index: 120; } \n' +
	'.calpopup .recurrence .repeat:before { content: attr(text); } \n' + 
	'.calpopup .recurrence > span { float: none; display: inline; }' + "\n" +
	'.calpopup .recurrence span { resize: none; outline: none; margin:0; padding:0; padding-right: .3em; min-height: 1em; display: inline; } ' + "\n" +
	'.calpopup .recurrence .byrule { clear: left; } \n' + 
	'.calpopup .alarm { resize: none; outline: none; margin:0; padding:0; padding-right: 2px; padding-left: 4px; min-width: 3em; min-height: 1em; display: block; float: left; margin-top: 6px; margin-bottom: 2px; }' + "\n" +
	'.calpopup .alarm .value { resize: none; outline: none; margin:0; padding:0; padding-right: .1em; padding-left: .1em; display: inline; float: none; }' + "\n" +
	'.calpopup .plus { display: block; float: left; padding-right: 2px; padding-left: 4px; margin-top: 6px; margin-bottom: 2px; text-decoration: underline; color: #00A; } ' + "\n" +
	'.alarm span { resize: none; outline: none; margin:0; padding:0; padding-right: .1em; padding-left: .1em; }' + "\n" +

	'#scheduling { position: absolute; display: -webkit-box; display: -moz-box; display: box; background: white; width: 42em; padding: .5em; -moz-box-shadow: 1px 1px 3px #888; -webkit-box-shadow: 1px 1px 3px #888; box-shadow: 1px 1px 3px #888; padding-top: .25em; line-height: 160%; padding-bottom: 2em; } ' +
	'#scheduling .button { position: absolute; padding: .2em; line-height: 100%; }' +
	'#scheduling .close { bottom: .25em; } '+
	'#schedusers { margin: 0; margin-top: 1em; padding:0; padding-right: 1em; padding-top: 2em; -moz-box-shadow-right: 1px 1px 3px white; -webkit-box-shadow-right: 1px 1px 3px white; box-shadow-right: 1px 1px 3px white; min-width: 9em; } ' +
	'#schedtime  { -webkit-box-flex: 3; display: -webkit-box; display: -moz-box; display: box; margin: 0; margin-top: 1em; padding:0; padding-top: 2em; margin-bottom: -16px; position: relative;  overflow-x: scroll; } ' +
	
	
	'#scheduling .suser0  { color: blue;    } ' +
	'#scheduling .suser1  { color: green;   } ' +
	'#scheduling .suser2  { color: magenta; } ' +
	'#scheduling .suser3  { color: purple;  } ' +
	'#scheduling .suser4  { color: cyan;    } ' +
	'#scheduling .suser5  { color: orange;  } ' +
	'#scheduling .suser6  { color: amber;   } ' +
	'#scheduling .suser7  { color: rose;    } ' +
	'#scheduling .suser8  { color: teal;    } ' +
	'#scheduling .suser9  { color: pink;    } ' +
	
	'#schedtime li { margin: 0; padding:0; width: 1.5em;  overflow: visible; padding-bottom: 16px; } ' +
	'#schedtime li:nth-child(2n) { background: #DDD; } ' +
	'#schedtime li:nth-child(1)::after { content: attr(data-month) "," attr(data-date); display: inline-block; position: relative; top: -2.4em; } ' +
	'#schedtime li[data-hour="0"]::after { content: attr(data-month) "," attr(data-date); display: inline-block; position: absolute; top: 0; } ' +
	'#schedtime li::before { content: attr(data-hour); display: inline-block; position: absolute; top: .9em; width: 1.5em; text-align: center; font-size: 90%; } ' +
	'#schedtime li span  { min-width:0.375em; height: 1.6em; position: absolute; } ' +
	'#schedtime li span.sched  { min-width:0.375em; outline: 1px solid #444; position: absolute; height: auto; top: 2em; bottom: 1.4em; background: none;} ' +
	'#schedtime li span.sched.conflict { outline-color: red; } ' +
  '#schedtime li span.start1 { margin-left: 0.375em; } '+
  '#schedtime li span.start2 { margin-left: 0.75em; } '+
  '#schedtime li span.start3 { margin-left: 1.275em; } '+
  '#schedtime li span[data-hours*=".25"] { padding-right: 0; } '+
  '#schedtime li span[data-hours*=".5"] { padding-right: .375em; } '+
  '#schedtime li span[data-hours*=".75"] { padding-right: .75em; } '+
  '#schedtime li span[data-hours^="0"]  { width: 0.375em; padding-right: 0; } '+
  '#schedtime li span[data-hours^="1"]  { width:  1.5em; } '+
  '#schedtime li span[data-hours^="2"]  { width:    3em; } '+
  '#schedtime li span[data-hours^="3"]  { width:  4.5em; } '+
  '#schedtime li span[data-hours^="4"]  { width:    6em; } '+
  '#schedtime li span[data-hours^="5"]  { width:  7.5em; } '+
  '#schedtime li span[data-hours^="6"]  { width:    9em; } '+
  '#schedtime li span[data-hours^="7"]  { width: 10.5em; } '+
  '#schedtime li span[data-hours^="8"]  { width:   12em; } '+
  '#schedtime li span[data-hours^="9"]  { width: 13.5em; } '+
  '#schedtime li span[data-hours^="10"] { width:   15em; } '+
  '#schedtime li span[data-hours^="11"] { width: 16.5em; } '+
  '#schedtime li span[data-hours^="12"] { width:   18em; } '+
  '#schedtime .hfraction3 { width: 1.5em; } '+
	'#schedtime .suser0  { top:    2em;  background: blue;    } ' +
	'#schedtime .suser1  { top:  3.6em;  background: green;   } ' +
	'#schedtime .suser2  { top:  5.2em;  background: magenta; } ' +
	'#schedtime .suser3  { top:  6.8em;  background: purple;  } ' +
	'#schedtime .suser4  { top:  8.4em;  background: cyan;    } ' +
	'#schedtime .suser5  { top:   10em;  background: orange;  } ' +
	'#schedtime .suser6  { top: 11.6em;  background: amber;   } ' +
	'#schedtime .suser7  { top: 13.2em;  background: rose;    } ' +
	'#schedtime .suser8  { top: 14.8em;  background: teal;    } ' +
	'#schedtime .suser9  { top: 16.4em;  background: pink;    } ' +

                            //  17  16
  '.calpopup .settings .label { width: 60%; } \n ' +
	//'.calpopup .label[extra] { outline: 1px solid blue; content: "XX" ; }' + "\n" +
	//'.calpopup .label.EEND[extra] + .value { color: white; content: ""; }' + "\n" +
	
	'.calpopup .privilegeOwner:nth-last-child(n+2):after { content: ","; padding-right: 0.15em; }' + "\n" +
	'.calpopup .add { position: absolute; bottom: 10px; left: 10px;}' + "\n" +
	'.calpopup .schedulebuttons { position: absolute; bottom: 10px; left: 10px; right: 10px; text-align: center; }' + "\n" +
	'.calpopup .group.smallschedulebuttons { position: absolute; bottom: 10px; right: 150px; text-align: right; -webkit-box-orient: vertical; -moz-box-orient: vertical; box-orient: vertical; overflow: hidden; height: 1.25em; }' + "\n" +
	'.calpopup .group.smallschedulebuttons:hover { overflow: visible; height: auto; margin-top: auto; }' + "\n" +

  '.calpopup .group.smallschedulebuttons:hover .button:nth-child(1) { margin-top: 0 !important; } ' + "\n" + 
	'.calpopup .group.smallschedulebuttons .button { border-right: 1px solid black;  -webkit-box-flex: 0; -moz-box-flex: 0; box-flex: 0; display: -webkit-box; display: -moz-box; display: box; -moz-box-orient: vertical; box-orient: vertical; }' + "\n" +
  
  '.calpopup .group.smallschedulebuttons.tentative .button:nth-child(1) { margin-top: -1.5em; } ' + "\n" + 
  '.calpopup .group.smallschedulebuttons.declined .button:nth-child(1) { margin-top: -3em; } ' + "\n" + 

	'.calpopup .dropdown { padding-right: 1.5em; padding-left: 1em; }' + "\n" +
	'.dropdown:after   { content: ""; display: block; position: absolute; right: 5px; width:0; height:0; border-color: #666 transparent transparent transparent; border-style: solid; border-width: 8px 4px 1px 4px;  '+
		' -webkit-transform: translate(0px, -1em) ; -moz-transform: translate(0px,-1em) ; transform: translate(0px,-1em); } ' + "\n" +
	'.calpopup .done { position: absolute; bottom: 10px; right: 10px; }' + "\n" +
	'.warning { text-shadow: #FF7400 0px 0px 3px; } ' + "\n" +
	'.calpopup .delete { position: absolute; bottom: 10px; right: 80px; }' + "\n" +
	'.calpopup .unbind { position: absolute; bottom: 10px; left: 10px; }' + "\n" +
	'.calpopup .bind { position: absolute; bottom: 10px; left: 10px; }' + "\n" +
	'.button { text-align: center; padding: 0.1em 1.25em 0.1em 1.25em; border: 1px solid #888; border-bottom: 1px solid #AAA; '+
		'-webkit-border-radius: 2px; -moz-border-radius: 2px; border-radius: 2px; font-size: 9pt; '+
		'background-color: #dddddd; background:  -moz-linear-gradient(top, #FFF 0%,#dadada 55%,#dddddd 100%); background: -webkit-gradient(linear, left top, left bottom, from(#FFF),color-stop(0.55,#dadada), to(#dddddd) ); background-image: -o-linear-gradient(top, #FFF 0%,#dadada 55%,#dddddd 100%); }' + "\n" +
	'.group { padding-left: 1px; padding-right: 1px; display: -webkit-box;display: box; -webkit-box-orient: horizontal; -webkit-box-pack: center; -moz-box-orient: horizontal; -moz-box-pack: center; box-orient: horizontal; box-pack: center; -moz-box-align: baseline; box-orient: horizontal; box-align: baseline; -moz-box-flex: 1; } '+"\n"+
	'.group .button { border-right: 0px; display: inline; display: -webkit-box; display: box;  -webkit-box-flex: 1; box-flex: 1; -webkit-border-radius: 0px; -moz-border-radius: 0px; border-radius: 0px; -moz-box-orient: horizontal; -moz-box-pack: center; text-align: center; }' + "\n" +
	'.group .button:first-child { border-right: 0px; -webkit-border-radius: 2px; -moz-border-radius: 2px; border-radius: 2px;  border-top-right-radius: 0px;  border-bottom-right-radius: 0px;  }' + "\n" +
	'.group .button:last-child { border-right: 1px solid #888; -webkit-border-radius: 2px; -moz-border-radius: 2px; border-radius: 2px;  border-top-left-radius: 0px;  border-bottom-left-radius: 0px;  }' + "\n" +
	'.question { padding-bottom: 1em; width: 100% } ' + "\n" +
	'.box2 { position: relative;width: 100% } ' + "\n" +
	'.box2 > * { position: relative; float: left;  margin-right: 1%; width: 48.9%; } ' + "\n" +
	'.box3 { position: relative; width: 100%; } ' + "\n" +
	'.box3 > * { position: relative; float: left; margin-right: 1%; width: 32.3%; } ' + "\n" +

	'#calheader { position: relative; width: 100%; font-weight: lighter; text-align: center; margin-left:2.5em; padding: .15em 2em 0; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; }' + "\n" +
	'#calyearname { font-size: 200%; position: relative; }' + "\n" +
	'#calmonthname { padding-right: 1em; font-size: 200%; position: relative; }' + "\n" +
	'#calmonthname:hover:before { content: "<"; position: absolute; left:-.7em; margin-top: -.1em; color: #aaa;}' + "\n" +
	'#calmonthname:hover:after  { content: ">"; position: absolute; margin-top: -0.1em; color: #aaa;}' + "\n" +
	'#calyearname:hover:before { content: "<"; position: absolute; margin-top: -.1em; left:-.7em; color: #aaa;}' + "\n" +
	'#calyearname:hover:after  { content: ">"; position: absolute; margin-top: -.1em; color: #aaa;}' + "\n" +
	'.week { width:100%; margin:0; padding:0; height:6em; padding-bottom: 1px; }' + "\n" +
	'.weeknum { width: 1.5em; border-top: 1px solid #AAA; border-right:1px solid #AAA; height: 6em; vertical-align: top; overflow: hidden; padding: 0; position: relative; -webkit-transition-property: all; -webkit-transition-duration: .2s; -moz-transition-property: all; -moz-transition-duration: .2s; transition-property: all; transition-duration: .2s;  }' + "\n" +
	'.currentweek { background-color: #efefff; }' + "\n" +
	'.weekview .weeknum { width: 3em; }' + "\n" +
	'.weekview .currentweek { background-color: none; }' + "\n" +
	'.weeknum:before { content: attr(weeknum); width: 100%; display: block; text-align: center; position: relative; margin-top: -0.5em; top: 50%; z-index: 5; }' + "\n" +
	'.weekview .week { width:100%; margin:0; padding:0; height:20em; padding-bottom: 1px; }' + "\n" +
	'.weekview td.weeknum:before { margin-top: -1.15em; }' + "\n" +
	//'.weekview td.weeknum:before { height: 0; overflow: visible;top: .5em; margin-top: 0; }' + "\n" +
	'.days { width: 100%; }' + "\n" +
	'.days TR { width: 100%; }' + "\n" +
	'.days TD {  padding:0; margin:0; width: 14%; display: block; float: left; text-align: center; font-weight: lighter; padding-right: 2px; padding-bottom: 4px;} ' + "\n" +
	'.days TD:first-child { padding-left: 1px; } ' + "\n" +
	'.day { display: table-cell; padding:0; margin:0; width: 14%; border-top: 1px solid #AAA; border-right:1px solid #AAA; height: 6em; max-height: 6em; vertical-align: top; overflow: hidden;' + "\n" +
    ' } ' + "\n" +
		//' -webkit-transition-property: all; -webkit-transition-duration: .2s; -moz-transition-property: all; -moz-transition-duration: .2s; transition-property: all; transition-duration: .2s;} ' + "\n" + 
	'.weekview .week .day { height: 100%; max-height: 100%; }' + "\n" +
	'.week:first-child .day { border-top: none !important; } ' + "\n" +
	'.day:hover { background-color: #F2F6FF !important; }' + "\n" +
	'.day > .header { position: relative; top:0; margin: 0.2em; height: 1.1em; float:right; width: 100%; text-align: right; z-index:10; }' + "\n" + //border-left: 1px solid black; border-bottom: 1px solid black; -moz-border-bottom-left-radius: 5px; -webkit-border-bottom-left-radius: 5px; border-radius-bottom-left: 5px; }' +
	'.day1 > .header:before { content: attr(month); margin-left: .2em; float: left; text-align: left; white-space: nowrap; color: grey; font-weight: lighter;  }' + "\n" +
	'.month1,.month3,.month5,.month7,.month9,.month11 { background-color: #FFF } ' + "\n" +
	'.month0,.month2,.month4,.month6,.month8,.month10,.month12 { background-color: #EEF; } ' + "\n" +
	'.today { background-color: #DDF !important; } ' + "\n" + 
	'.day ul.eventlist { width: 100%; padding: 0; margin: 0; margin-top: 1.4em; min-height: 5em; max-height: 5em; list-style-type: none; }' + "\n" +
	'.hourswrapper { display: none; position: relative; height:0; } ' + "\n" +
	'.weekview .week ul.hoursbg { position: absolute; width: 100%; padding: 0; margin: 0; margin-top: 1.4em; list-style-type: none; height: 100%; color: #CCC; }' + "\n" + 
	'.weekview div.hourswrapper { display: block; }' + "\n" + 
	'.weekview div.hourswrapper .hoursbg li { display: block; width: 100%; text-align: right; white-space: pre; overflow: hidden; }' + "\n" + 
	'.weekview .day div.hourswrapper .hoursbg li { content:""; }' + "\n" + 
	'.weekview div.hourswrapper .hoursbg li:nth-child(2n+1) { background-color: rgba(75%,75%,75%,0.35); width: 100%; }' + "\n" + 
	'.weekview .week .day ul.eventlist { position: relative; max-height: 100%; z-index: 2; }' + "\n" + 
	'.weekview .day ul.eventlist li.event:hover { z-index: 3; }' + "\n" + 
	'.day ul.eventlist > li { width: 100%; float:left; } ' +	"\n" + 
	'.day ul.eventlist > li:nth-last-child(1n+6), .day ul.eventlist > li:nth-last-child(1n+6) ~ li { width: 50%; } ' +	"\n" + 
	'.day ul.eventlist > li:nth-last-child(1n+11), .day ul.eventlist > li:nth-last-child(1n+11) ~ li { width: 33.34%; } ' +	"\n" + 
	'.day ul.eventlist > li:nth-last-child(1n+16), .day ul.eventlist > li:nth-last-child(1n+16) ~ li { width: 25%; } ' +	"\n" + 
	'.day ul.eventlist > li:nth-last-child(1n+21), .day ul.eventlist > li:nth-last-child(1n+21) ~ li { width: 20%; } ' +	"\n" + 
	'.day ul.eventlist > li:nth-last-child(1n+26), .day ul.eventlist > li:nth-last-child(1n+26) ~ li { width: 16.7%; } ' +	"\n" + 
	'.day ul.eventlist > li:nth-last-child(1n+31), .day ul.eventlist > li:nth-last-child(1n+31) ~ li { width: 14.28%; } ' +	"\n" + 



	'.weekview .day ul.eventlist > li[data-duration] { padding-left: 0; border-right-width: 13px; width: 100%; }' + "\n" + 
	'#caltodo .event { margin:0; margin-top: 0; padding-left: .3em; padding-top: .2em; padding-bottom: .2em; display: list-item; font-size: 10pt; vertical-align: top; height: 1.1em; overflow: hidden; text-overflow: ellipsis; ' + "\n" +
		' -webkit-transition-property: all; -webkit-transition-duration: .2s; -moz-transition-property: all; -moz-transition-duration: .2s; transition-property: all; transition-duration: .2s;} ' + "\n" + 
	
	'.day .event { -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; width: 100%; max-width: 100%; white-space: nowrap; text-overflow: ellipsis; margin:0; margin-top: 0; padding-left: .7em; font-size: 10pt; vertical-align: top; max-height: 1.1em; overflow: hidden; ' + "\n" +
		'  min-height: 3px; ' + "\n" +
		' -webkit-transition-property: all; -webkit-transition-duration: .2s; -moz-transition-property: all; -moz-transition-duration: .2s; transition-property: all; transition-duration: .2s;} ' + "\n" + 
	
	'#wcal .event:before                          { content: " "; font-face: times; width: 0px; position: relative; display: block; float: left; height: 1.1em; margin-left: -.7em; border-left: .15em solid; border-right: .15em solid; }' + "\n" +
	'#wcal .event[transparent=TRANSPARENT]:before { content: " "; font-face: times; width: 4px; position: relative; display: block; float: left; height: .15em; margin-left: -.7em; border: none; border-top: .471em double; border-bottom: .471em double;  }' + "\n" +
	"#wcal .event[status=CANCELLED] { text-decoration: line-through; } \n" +
	"#wcal .day ul li.event[status=TENTATIVE] { opacity: 0.75; border-bottom: 2px solid gold; } \n" +
	"#wcal .day ul li.event[status=CONFIRMED] { opacity: 0.75; border-bottom: 0px solid green; } \n" +
	'.event:hover { color: white;  -webkit-box-flex: 0; -moz-box-flex: 0; box-flex: 0; min-height: 1em; }' + "\n" +
	'.eventstart.event:before { content:none !important;  }' + "\n" +
	'.eventstart { -webkit-box-flex: 0; -moz-box-flex: 0; box-flex: 0; text-wrap: none; -moz-border-radius: .5em 0px 0px .5em; -webkit-border-radius: .5em 0px 0px .5em; border-radius: .5em 0px 0px .5em; } ' + "\n" +
	'.eventend { -webkit-box-flex: 0; -moz-box-flex: 0; box-flex: 0; padding:0px !important; -moz-border-radius: 0px .5em .5em 0px; -webkit-border-radius: 0px .5em .5em 0px; border-radius: .0px .5em .5em 0px; } ' + "\n" +
	
	'#calpopup,#calpopupe,.calpopup {position:absolute; z-index: 10;  width: 300px; min-height: 300px; border:1px solid #AAA; background:#FFF; font-size: 11pt; -moz-border-radius:5px; -webkit-border-radius:5px; border-radius:5px; '+
		'-moz-box-shadow: 3px 3px 10px #888; -webkit-box-shadow: 3px 3px 10px #888; box-shadow: 3px 3px 10px #888; -webkit-transform: translate(3px,-22px); -moz-transform: translate(3px,-22px); transform: translate(3px,-22px);}' + "\n" +
	'#calpopup { overflow: visible; } ' + "\n" +
	'.calpopupe { min-width: 200px; min-height: 150px;   } ' + "\n" +
	'.calpopup { padding: 0.5em;resize:both; -webkit-transition-property: display; -webkit-transition-duration: 0.2s; -moz-transition-property: display; -moz-transition-duration: .2s; transition-property: display; transition-duration: .2s;}' + "\n" + 
  '#calpopupe.bottom,#calpopup.bottom,.calpopup.bottom { -webkit-transform: translate(3px,-2px); -moz-transform: translate(3px,-2px); transform: translate(3px,-2px); } ' + "\n" +
	'.calpopup * { resize:none; } ' + "\n" +
	'.calpopup .granted { color: green; border-bottom: 2px solid green; }' + "\n" +
	'.calpopup .granted li { color: green; border-bottom: 2px solid green; }' + "\n" +
	'.calpopup.left:before { content: ""; position: absolute; display: block; top: 20px; left:-9px; width: 15px; height:15px; border:1px solid #AAA;  background:#FFF; '+
		'-moz-box-shadow: 0px 0px 6px #888; -webkit-box-shadow: 0px 0px 6px #888; box-shadow: 0px 0px 6px #888; z-index: -10; '+
		'-webkit-transform: rotate(45deg); -moz-transform: rotate(45deg); -ms-transform: rotate(45deg); transform: rotate(45deg); z-index: 0;} ' + "\n" +
	'.calpopup.left:after { content: ""; position: absolute; display: block; top: 13px; left: 0; width: 15px; height:30px; background:#FFF; z-index: 10;} ' + "\n" +
	'.calpopup.right:before { content: ""; position: absolute; display: block; top: 20px; right:-9px; width: 15px; height:15px; border:1px solid #AAA;  background:#FFF; '+
		'-moz-box-shadow: 0px 0px 6px #888; -webkit-box-shadow: 0px 0px 6px #888; box-shadow: 0px 0px 6px #888; z-index: -10; '+
			'-webkit-transform: rotate(45deg); -moz-transform: rotate(45deg); -ms-transform: rotate(45deg); transform: rotate(45deg); z-index: 0;} ' + "\n" +
	'.calpopup.right:after { content: ""; position: absolute; display: block; top: 13px; right:0; width: 15px; height:30px; background:#FFF; z-index: 10;} ' + "\n" +

	'.calpopup.left.bottom:before { content: ""; position: absolute; display: block; top: 250px; left:-9px; width: 15px; height:15px; border:1px solid #AAA;  background:#FFF; '+
		'-moz-box-shadow: 0px 0px 6px #888; -webkit-box-shadow: 0px 0px 6px #888; box-shadow: 0px 0px 6px #888; z-index: -10; '+
		'-webkit-transform: rotate(45deg); -moz-transform: rotate(45deg); -ms-transform: rotate(45deg); transform: rotate(45deg); z-index: 0;} ' + "\n" +
	'.calpopup.left.bottom:after { content: ""; position: absolute; display: block; top: 243px; width: 15px; height:30px; background:#FFF; z-index: 10;} ' + "\n" +
	'.calpopup.right.bottom:before { content: ""; position: absolute; display: block; top: 250px; right:-9px; width: 15px; height:15px; border:1px solid #AAA;  background:#FFF; '+
		'-moz-box-shadow: 0px 0px 6px #888; -webkit-box-shadow: 0px 0px 6px #888; box-shadow: 0px 0px 6px #888; z-index: -10; '+
		'-webkit-transform: rotate(45deg); -moz-transform: rotate(45deg); -ms-transform: rotate(45deg); transform: rotate(45deg); z-index: 0;} ' + "\n" +
	'.calpopup.right.bottom:after { content: ""; position: absolute; display: block; top: 243px; right:0; width: 15px; height:30px; background:#FFF; z-index: 10;} ' + "\n" +

	'.databool { content: "" !important; } ' + "\n" +
	'.databool.boolselected:before { content: marker("disc"); color: blue; } ' + "\n" +

	'.event[data-time^="0."] { color: white !important; } ' + "\n" +
	'#wcal .event[data-time^="0."]:before { display: none;  } ' + "\n" +
	'.privilegeBox { position: absolute; display: none; background-color: white; border: 1px solid #999; width: 32em;}' + "\n" +
	'.privilegeOwner:hover .privilegeBox { display: block; }' + "\n" +
	'.privilegeBox li { border-bottom: 2px solid white; }' + "\n" +
	'.privilegeBox > ul >li { width:100%; clear: both; }' + "\n" +
	'.privilegeBox * { padding:0; margin: 0; color: #AAA; }' + "\n" +
	'.privilegeBox li ul { display: inline; position: relative; width: 22.5em;  }' + "\n" +
	'.privilegeBox li li { float:right ; width: 7.5em; }' + "\n" +
	'.completionWrapper { position: absolute; top:0; margin:0; margin-top: 2em; z-index: 100; padding: 0; min-height:0 ; max-width: ; min-width: 0; overflow: hidden; padding-right: -1em; ' + "\n" +
		'-moz-box-shadow: 0px 0px 6px #888; -webkit-box-shadow: 0px 0px 6px #888; box-shadow: 0px 0px 6px #888; } '+ "\n" +
	'.completion { z-index: 100; padding: 0; min-height:0 ; max-height: 20em; min-width: 0;background: white; overflow-y: auto ; overflow-x: hidden; padding-right: 19px; margin-right: -18px; }' + "\n" +
	'#caltodo .completionWrapper,#caltodo .completionWrapper > div { text-align: left; font-size: 8pt; font-weight: normal; }' + "\n" +
	'#caltodo .completionWrapper .completion div { text-align: left; }' + "\n" +
	'.completion div:first-child {margin: 0 0 0 0; } ' + "\n" +
	'.completion div:nth-last-child(11) ~ div:last-child {margin-bottom: 1em; } ' + "\n" +
	'.completion div { width: 110%; margin: 0; padding: .3em; white-space: pre; padding-left: .5em; padding-right: .5em; -moz-transition-property: all; -moz-transition-duration: .2s; -webkit-transition-property: all; -webkit-transition-duration: .2s; transition-property: all; transition-duration: .2s; } ' + "\n" +
	'.completion div:hover { background: #AAA !important; } ' + "\n" +
	'.completion div:nth-last-child(11):before { content: ""; display: block; position: absolute; top: 19em; left: 0; height: 1em; width: 100%; z-index:110; background: -webkit-gradient(linear, left top, left bottom, from(rgba(255,255,255,0)), to(rgba(160,160,160,1))); background: -webkit-linear-gradient(top, rgba(255,255,255,0) 0%, rgba(160,160,160,1) 100%); background: linear-gradient(top, rgba(255,255,255,0) 0%, rgba(160,160,160,1) 100%);} \n' +
	//'.completion div:nth-last-child(8):before { display: block; position: relative; top: 5em; left: 0; height: .5em; width: 100%; outline: 1px solid green; background: blue; z-index:110;  } \n' +
	'.completion:not(.multiselect):hover div.selected { background: none; } ' + "\n" +
	'.completion div.selected { background: #AAA; } ' + "\n" +
	'.completion div.highlighted { background: #BBA; } ' + "\n" +
	'.completion div.remove { height: 1em; } ' + "\n" +
	'.completion div.remove:before { content: attr(text); color: #787878; } ' + "\n" +
	

	'.timeline { margin: 0 ; padding:0; width: 1em; position: absolute; bottom: 1px; height: 100%;   } ' + "\n" +
	'.timeline ol { list-style-type: none; margin: 0 ; margin-left: -0.08em; padding:0; width: 1.5em; position: absolute; bottom: 1px; height: 100%; } ' + "\n" +
	'.timeline ol:hover { padding-top: 0; -webkit-transition: all 0.2s; -moz-transition: all 0.2s; -moz-transition-property: all; -moz-transition-duration: .2s; transition: all 0.2s; } ' + "\n" +
	'.timeline ol li.line { position: absolute; height: 1em; top: 0; right: 0.4em; text-align: right; margin: 0; padding:0; width: 2.5em; font-size: 100% !important; '+
		'color: green; -webkit-transition: none 0.0s; -moz-transition: all 0.2s; transition: all 0.2s; -moz-transition-property: all; -moz-transition-duration: .2s; z-index: 2; } ' + "\n" +
	'.timeline ol li.current { position: absolute; height: 0; left: 0; margin-top: 0; margin-left: 2px; padding:0; width: 0.85em; font-size: 100% !important; '+
		'border-top: 2px solid red; -webkit-transition: none 0.0s; -moz-transition: all 0.2s; transition: all 0.2s; -moz-transition-property: all; -moz-transition-duration: .2s; z-index: 1; } ' + "\n" +
	'.timeline li { list-style-type: none; margin: 0 ; padding:0; color: #999; position: relative; height: 17.15%; width:1em; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; '+
		'-webkit-transition: all 0.2s; -moz-transition: all 0.2s; transition: all 0.2s; overflow: hidden ; white-space: nowrap; -moz-transition-property: all; -moz-transition-duration: .2s; z-index: 3; padding-top: 40%; border-color: #999; } ' + "\n" +
	'.timeline li span { padding:0; margin:0; display: block; position: absolute; margin-bottom: -0.5em; bottom: 50%; font-size: 120%; } ' + "\n" +
	'.timeline li:nth-child(2n+1) { color: #9898C8; border-color: #9898C8; } ' + "\n" +
	'.timeline li.hover120 { font-size: 150%; margin-left: 2px; text-indent: -0.2em; width: 4em; overflow: visible;border-left: 1px solid; } ' + "\n" +
	'.timeline li.hover165 { font-size: 200%; margin-left: 2px; text-indent: -0.2em; width: 4em; overflow: visible;border-left: 2px solid; } ' + "\n" +
	'.timeline li.hover200 { font-size: 300%; margin-left: 2px; text-indent: -0.2em; width: 4em; overflow: visible; border-left: 4px solid; } ' + "\n" +
	'.timeline li.hover200 span { } ' + "\n" +
	'.timeline li.hover165a { font-size: 200%; margin-left: 2px; text-indent: -0.2em; width: 4em; overflow: visible; border-left: 2px solid; } ' + "\n" +
	'.timeline li.hover120a { font-size: 150%; margin-left: 2px; text-indent: -0.2em; width: 4em; overflow: visible; border-left: 1px solid; } ' + "\n" +
	'#calcurrenttime { position: absolute; height: 0; left: 1px; margin: 0;  padding:0; width: 110%; border-bottom: 1px solid red; '+
		'-webkit-transition: none 0.0s; -moz-transition: all 0.2s; transition: all 0.2s; -moz-transition-property: all; -moz-transition-duration: .2s; z-index: 1; } ' + "\n" +
	'.weekview #calcurrenttime { margin-top: 1em; } '+"\n"+
	wvs +

	'#callightbox { position: absolute; top:0; left:0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); z-index: 20;} ' + "\n" +
	".colorpicker { position: absolute; width: 8em; height: 7em; background-color: white; z-index: 99;} \n" +
	".colorpicker span { display: block; float: left; width: 1em; height: 1em; margin: 0.2em 0.166em 0.2em 0.166em;  } \n" + 
	".color1  { background-color: #000088; } .color2  { background-color: #008800; } .color3  { background-color: #880000; } .color4  { background-color: #008888; } .color5  { background-color: #880088; } .color6  { background-color: #888800; } \n" + 
	".color7  { background-color: #4444CC; } .color8  { background-color: #44CC44; } .color9  { background-color: #CC4444; } .color10 { background-color: #44CCCC; } .color11 { background-color: #CC44CC; } .color12 { background-color: #CCCC44; } \n" +
	".color13 { background-color: #0000FF; } .color14 { background-color: #00FF00; } .color15 { background-color: #FF0000; } .color16 { background-color: #00FFFF; } .color17 { background-color: #FF00FF; } .color18 { background-color: #FFFF00; } \n" + 
	".color19 { background-color: #4444FF; } .color20 { background-color: #44FF44; } .color21 { background-color: #FF4444; } .color22 { background-color: #44FFFF; } .color23 { background-color: #FF44FF; } .color24 { background-color: #FFFF44; } \n" + 
	".color25 { background-color: #8888FF; } .color26 { background-color: #88FF88; } .color27 { background-color: #FF8888; } .color28 { background-color: #88FFFF; } .color29 { background-color: #FF88FF; } .color30 { background-color: #FFFF88; } \n" + 
	"#translator .label { width: 10em; } \n" +
	"#translator .missing { outline: 2px dashed red; } \n" +
	
	'#caldrop { position: absolute; top: 0; left: 0; text-align: right; margin: 0; padding: 0; background: white; border-bottom: 1px solid red; width: 30%; height: 1em;  z-index: 99; }' + "\n" +
	"#caldavloading1 span { -webkit-text-fill-color: transparent; display: block; width: 200%; margin-left: -50%; background-position: -3.5em 0; \n"+
  "  -webkit-animation-name: 'colorcycle'; -webkit-animation-duration: 2s; -webkit-animation-iteration-count: infinite; -webkit-animation-timing-function: ease; \n"+
	" background-image: -webkit-gradient(linear,left top,right top,color-stop(0, #555),color-stop(0.4, #555),color-stop(0.5, white),color-stop(0.6, #555),color-stop(1, #555));\n"+
	" background-image: -webkit-linear-gradient(left ,#555 0%, #555 40%, white 50%, #555 60%, #555 100% ); \n"+
	" background-image: -moz-linear-gradient(left ,#555 %0,#555 40%, white 50%, #555 60%, #555 100%); background-image: linear-gradient(left ,#555 %0,#555 40%, white 50%, #555 60%, #555 100%); \n" +
	" -webkit-background-clip: text; } \n "+
  "@-webkit-keyframes 'colorcycle' { from { background-position: -3.5em 0; } to { background-position: 3.5em 0; } }: \n"+
	'</style>';
	$(document.body).append(cs);
}


