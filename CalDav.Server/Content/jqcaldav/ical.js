///////////////////////////////////////////////////////////////////////
//                iCal Handling accepts files or fragments

var iCal = function ( text ) {
	this.prototype = Array.prototype;
	this.icsTemplateVevent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//jqCalDav\nCALSCALE:GREGORIAN\nBEGIN:VEVENT\nSUMMARY:"+ui['New Event']+"\nDTEND:19700101\nTRANSP:TRANSPARENT\nDTSTART:19700101\nDTSTAMP:19700101T000000Z\nSEQUENCE:0\nEND:VEVENT\nEND:VCALENDAR";
	this.icsTemplateVtodo = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//jqCalDav\nCALSCALE:GREGORIAN\nBEGIN:VTODO\nSUMMARY:"+ui['New Todo']+"\nDTEND;VA\nTRANSP:TRANSPARENT\nDTSTAMP:19700101T000000Z\nSEQUENCE:0\nDUE;VALUE=DATE:19700101\nSTATUS:NEEDS-ACTION\nEND:VTODO\nEND:VCALENDAR";
	this.icsTemplateVjournal = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//jqCalDav\nCALSCALE:GREGORIAN\nBEGIN:VJOURNAL\nSUMMARY:"+ui['New Journal']+"\nDTSTAMP:19700101T000000Z\nSEQUENCE:0\nEND:VJOURNAL\nEND:VCALENDAR";
	this.icsTemplateVfreebusy = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//jqCalDav\nMETHOD:REQUEST\nBEGIN:VFREEBUSY\nDTSTAMP:19700101T000000Z\nDTSTART:19700101T000000Z\nDTEND:19700101T000000Z\nEND:VFREEBUSY\nEND:VCALENDAR";

	this.components = { 
		vcalendar:{required:['version','prodid',['vevent','vtodo','vjournal','vfreebusy']],optional:['calscale','method','vtimezone']},
		vevent:{required:['dtstamp','uid','dtstart'],optional:['dtend','duration','class','created','description','geo','last-modified','location','organizer','priority','sequence','status','summary','transp','url','recurrence-id','attach','attendee','categories','comment','contact','exdate','request-status','related-to','resources','rdate','rrule','request-status']},
		vtodo:{required:['dtstamp','uid'],optional:['dtstart','due','class','completed','created','description','geo','last-modified','location','organizer','percent-complete','priority','sequence','status','summary','url','recurrence-id','attach','attendee','categories','comment','contact','exdate','request-status','related-to','resources','rdate','rrule','request-status']},
		vjournal:{required:['dtstamp','uid'],optional:['dtstart','class','created','description','last-modified','organizer','sequence','status','summary','url','recurrence-id','attach','attendee','categories','comment','contact','exdate','request-status','related-to','resources','rdate','rrule','request-status']},
		vfreebusy:{required:['dtstamp','uid'],optional:['contact','dtstart','dtend','organizer','url','attendee','comment','freebusy','request-status']},
		valarm:{required:['action','trigger'],optional:['description','duration','repeat','attach','summary',,'attendee']},
		vtimezone:{required:['tzid','dtstart','tzoffsetto','tzoffsetfrom'],optional:['last-modified','tzurl','standard','daylight','tzname','comment','rdate']},
		daylight:{required:['dtstart','tzoffsetto','tzoffsetfrom'],optional:['last-modified','tzurl','tzname','comment','rdate','rrule']},
		standard:{required:['dtstart','tzoffsetto','tzoffsetfrom'],optional:['last-modified','tzurl','tzname','comment','rdate','rrule']}
	};
	this.fields = {
		version:{max:1,visible:false,type:'text','default':'2.0'},
		prodid:{max:1,visible:false,type:'text','default':'-//jqCalDav'},
		calscale:{max:1,visible:false,type:'text','default':'GREGORIAN'},
		summary:{max:1,visible:true,type:'text'},
		dtstart:{max:1,visible:true,type:'date','default':(new Date()).DateString()},
		dtend:{max:1,visible:true,type:'date'},
		duration:{max:1,visible:true,type:'duration'},
		rrule:{max:1,visible:true,type:'recurrence'},
		'recurrence-id':{max:1,visible:false,type:'date'},
		transp:{max:1,visible:true,type:'text',values:{vevent:['TRANSPARENT','OPAQUE']},'default':'TRANSPARENT'},
		due:{max:1,visible:true,type:'date'},
		completed:{max:1,visible:true,type:'date'},
		status:{max:1,visible:true,type:'text',values:{vevent:['TENTATIVE','CONFIRMED','CANCELLED'],vtodo:['NEEDS-ACTION','COMPLETED','CANCELLED','IN-PROCESS'],vjournal:['DRAFT','FINAL','CANCELLED']}},
		priority:{max:1,visible:true,type:'integer',range:{vevent:[0,9],vtodo:[0,9]}},
		'percent-complete':{max:1,visible:true,type:'integer',range:{vtodo:[0,100]}},
		location:{max:1,visible:true,type:'text'},
		geo:{max:1,visible:true,type:'latlon'},
		description:{max:1,visible:true,type:'text'},
		'class':{max:1,visible:true,type:'text',values:{vevent:["PUBLIC","PRIVATE","CONFIDENTIAL"],vtodo:["PUBLIC","PRIVATE","CONFIDENTIAL"],vjournal:["PUBLIC","PRIVATE","CONFIDENTIAL"]}},
		attach:{max:-1,visible:true,type:'text'}, // actually it could be a uri
		method:{max:1,visible:false,type:'text'},
		tzid:{max:1,visible:false,type:'text'},
		tzoffsetfrom:{max:1,visible:false,type:'utc-offset'}, // should be utc-offset
		tzoffsetto:{max:1,visible:false,type:'utc-offset'}, // should be utc-offset,
		tzurl:{max:1,visible:false,type:'uri'},
		organizer:{max:1,visible:true,type:'schedule'},
		url:{max:1,visible:true,type:'uri'},
		uid:{max:1,visible:false,type:'text'},
		action:{max:1,visible:false,type:'text'},
		repeat:{max:1,visible:false,type:'integer'},
		trigger:{max:1,visible:false,type:'trigger'},
		created:{max:1,visible:false,type:'date'},
		dtstamp:{max:1,visible:false,type:'date'},
		'last-modified':{max:1,visible:false,type:'date'},
		sequence:{max:1,visible:false,type:'integer','default':0},
		rdate:{max:-1,visible:true,type:'rdate'},
		freebusy:{max:-1,visible:false,type:'period'},
		comment:{max:-1,visible:true,type:'text'},
		resources:{max:-1,visible:true,type:'text'},
		categories:{max:-1,visible:true,type:'text'},
		attendee:{max:-1,visible:true,type:'schedule'},
		contact:{max:-1,visible:true,type:'text'},
		exdate:{max:-1,visible:false,type:'date'},
		tzname:{max:-1,visible:false,type:'text'},
		link:{max:-1,visible:true,type:'uri'},
		'related-to':{max:-1,visible:false,type:'text'},
		'request-status':{max:-1,visible:false,type:'text'},
		// X-properties are non standard
		//
		//  https://trac.calendarserver.org/browser/CalendarServer/trunk/doc/Extensions/caldav-privatecomments.txt
		'x-calendarserver-private-comment':{max:-1,visible:true,type:'text'}, 
		//  https://trac.calendarserver.org/browser/CalendarServer/trunk/doc/Extensions/caldav-privateevents.txt
		'x-calendarserver-access':{max:1,visible:true,type:'text',values:{vevent:["PUBLIC","PRIVATE","CONFIDENTIAL","RESTRICTED"],vtodo:["PUBLIC","PRIVATE","CONFIDENTIAL","RESTRICTED"],vjournal:["PUBLIC","PRIVATE","CONFIDENTIAL","RESTRICTED"]}},
	};

	this.parseiCal = function ( text )
	{
		var dRX = /([0-9]{4})([0-9]{2})([0-9]{2})([Tt]([0-2][0-9])([0-6][0-9])([0-9]{2}))?[Zz]?/;
		var types = /(VEVENT|VTODO|VJOURNAL|VFREEBUSY)/;
		var t = text.replace(/\r?\n[\s\t]/mg,'').split ("\n");
		var ret = new Array ();
		var ic = new Object ;
		ic['RAW'] = text;
		ic.propertyIsEnumerable('RAW',false);
		var c = ic;
		var previous = new Array ();
		previous.push(c);
		for (var i=0;i<t.length;i++)
		{
			//var l = t[i].match( /^(.*?):(.*)/m ); bad regex, need to ignore separators in ""
			var l = t[i].match( /^((?:'[^']*')|(?:[^:]+)):(.*)/m ); // (?:'[^']*')|(?:[^, ]+)
			if ( l == null  )
				continue;
			l = l.slice(1);
			var a=l[1].replace(/\\(,|;)/g,'$1');
			l[1]=a.replace(/\\[Nn]/g,"\n");
			l0l = l[0].toLowerCase();
			if ( l[0] == 'BEGIN' )
			{
				var old = c;
				previous.push(c);
				var c = new Object;
				c['BEGIN'] = true;
				c.propertyIsEnumerable('BEGIN',false);
				if ( old[l[1].toLowerCase()] != undefined  && ! types.test(l[1]) )
				{
					if ( typeof old[l[1].toLowerCase()] != "array" )
						old[l[1].toLowerCase()] = new Array ( $.extend({},old[l[1].toLowerCase()] ) );
					old[l[1].toLowerCase()].push(c);
				}
				else
					old[l[1].toLowerCase()]=c;
				continue ;
			}
			else if ( l[0] == 'END' )
			{
				c.UPDATED = false ;
				if ( types.test(l[1]) )
				{
					ret.push($.extend(true,{},ic));
					ret[ret.length-1].TYPE=l[1].toLowerCase();
				}
				else if ( l[1].toLowerCase() == 'vtimezone' )
				{
					this.tz = new zones(c);
				}
				var c = previous.pop();
				continue ;
			}
			else if ( l[0] == 'RRULE' )
				c[l0l] = this.newField(l0l,l[1]);
			else if ( l[0].match( /;/ ) )
			{
				var a = new Object ;
				var p = l[0].split(';');
				l0l = p[0].toLowerCase();
				for (var x=1;x<p.length;x++ ) 
				{
					var pp = p[x].split('=');
					a[pp[0].toLowerCase()] = pp.slice(1).join();
				}
				if ( c[l0l] != undefined )
					c[l0l].UPDATE(l[1],a);
				else
					c[l0l] = this.newField(l0l,l[1],a);
			}
			else if ( c[l0l] != undefined )
				c[l0l].UPDATE(l[1]);
			else
				c[l0l] = this.newField(l0l,l[1]);
			c[l0l].PARENT = c; 
		}
		return ret;
	};
	
	this.printiCal = function ( timezone )
	{
		this.parts = {VTIMEZONE:[],VEVENT:[],VTODO:[],VJOURNAL:[] };
		this.depth =0;
		var vcal = this.print ( this.ics, timezone );
		for ( var i in this.parts )
		{
			for ( var j in this.parts[i] )
				vcal = vcal + this.parts[i][j];
		}
		vcal = vcal + "END:VCALENDAR\n";
		if ( debug ) console.log ( vcal );
		return vcal;
	};

	this.print = function ( ics, timezone )
	{
		if ( timezone != null )
			this.timezones = timezone;
		var types = /(VEVENT|VTODO|VJOURNAL)/;
		var text = '';
		var printed = {};
		for ( var i in ics )
		{
			var line = '';
			if ( i-0 == i )
			{
				text += this.print(ics[i],false);
				continue;
			}
			if ( i == i.toUpperCase() )
				continue;
			if ( ics[i] instanceof Object )
			{
				if ( ics[i].BEGIN || ics[i].SERIALIZE == undefined )
				{
					if ( ics[i].UPDATED )
					{
						if ( ics[i].sequence )
							ics[i].sequence.VALUE ++;
						if ( ics[i].dtstamp )
							ics[i].dtstamp.UPDATE ( new Date() );
					}
					line = 'BEGIN:' + i.toUpperCase() + "\n";
					if ( i == 'vtimezone' || timezone )
						line += this.print(ics[i],true);
					else
					{
						if ( ics[i] instanceof Array )
						{
							for ( var j=0; j<ics[i].length; j++ )
							{
								line += this.print(ics[i][j],false);
								if ( j+1 < ics[i].length )
								{
									line += 'END:' + i.toUpperCase() + "\n";
									line += 'BEGIN:' + i.toUpperCase() + "\n";
								}
							}
						}
						else
							line += this.print(ics[i],false);
					}
					var end = 'END:' + i.toUpperCase() + "\n";
					if ( i != 'vcalendar' )
						line += end;
					else
						this.depth++;
					if ( types.test ( i.toUpperCase() ) )
					{
						this.parts[i.toUpperCase()].push ( line );
						line = '';
					}
					else if ( this.depth > 1 ) 
						line = '';
				}
				else
				{
					if ( this.fields[i] != undefined && this.fields[i].max > 0 && printed[i] >= this.fields[i].max )
						continue;
					printed[i]++;
					line = ics[i].SERIALIZE(); 
				}
			}
			else
			{
				if ( i == i.toUpperCase() )
					continue ;
				if ( this.fields[i].max > 0 && printed[i] > this.fields[i].max )
					continue;
				switch ( i )
				{
					case 'dtstamp':
						line = 'DTSTAMP:' + (new Date()).DateString() + "\n";
						break ;
					case 'sequence':
						line = 'SEQUENCE:' + ics[i].VALUE + 1 + "\n";
						break ;
					default :
						line = i.toUpperCase() + ':' + ics[i] + "\n";
				}
				printed[i]++;
				if ( line.length > 72 )
					for ( var z=72;z<line.length;z+=72)
						line = line.slice(0,z) + "\n " + line.slice(z);
			}
			text += line;
		}
		return text;
	};


	this.toString = this.printiCal;

	this.pop=function(){return this.ics.pop();};
	this.push=function(i){return this.ics.push(i);};
	this.reverse=function(){return this.ics.reverse();};
	this.shift=function(){return this.ics.shift();};
	this.splice=function(i){return this.ics.splice(i);};
	this.unshift=function(i){return this.ics.unshift(i);};
	this.slice=function(b,e){return this.ics.slice(b,e);};
	this.pop=function(){return this.ics.pop();};
	this.UPDATEx = function(){
		this.dateValues = function (d){
			if ( d.getDate ) return	{DATE: d,VALUE:d.DateString()};
			else if ( String(d).match(/\s/) ) {var n=Zero().parsePrettyDate(d); return {DATE:n,VALUE:n.DateString()};}
			else return {DATE:Zero().parseDate(d),VALUE:d}; };
		this.SETDATE = function ()
		{
			if ( arguments[1] instanceof Object )
			{
				var props = arguments[1];
				if ( arguments[2] != undefined )
					p = arguments[2];
			}
			else if ( arguments.length > 1 )
				p = arguments[1];
			var n = this.dateValues(arguments[0]);
			if ( this.VALUES )
			{
				if ( this.DATES == undefined ) 
				{
					this.DATES = new Array ;
					this.VALUES.push(this.VALUE);
					this.DATES.push(this.DATE);
					this.PROPS = {} ;
					if ( props )
						this.PROPS[this.DATE] = props;
				}
				if ( p )
				{
					var  i = this.DATES.indexOf(p)?this.DATES.indexOf(p):this.VALUES.indexOf(p);
					if ( i < 0 ) i = this.VALUES.length;
					this.VALUES[i] = n.VALUE;
					this.DATES[i] = n.DATE;
					if ( this.PROPS[p] )
					{
						this.PROPS[n.DATE] = this.PROPS[p];
						delete this.PROPS[p];
					}
				}
				else
				{
					if ( props )
					{
						if ( typeof props == 'object' && props['TZID'] == undefined )
							n.DATE.zulu = true;
						this.PROPS[n.DATE] = props;
					}
					else 
						n.DATE.zulu = true;
					this.VALUES.push(n.VALUE);
					this.DATES.push(n.DATE);
				}
			}
			else 
			{ 
				this.DATE = n.DATE;
				this.VALUE = n.VALUE;
				if ( props )
				{
					this.PROP = props;
					if ( typeof props == 'object' && props['TZID'] == undefined )
						this.DATE.zulu = true;
				}
				else 
					this.DATE.zulu = true;
        if ( this.FIELD == 'due' && this.PROP['value'] != undefined )
        {
          this.SHORT = true;
          this.DATE.zulu = false;
          this.DATE.ZeroTime();
        }
			} 
		};
		this.PERIOD = function ()
		{
			//FREEBUSY;FBTYPE=BUSY-UNAVAILABLE:20110722T030000Z/20110722T130000Z,20110722T230000Z/20110725T130000Z,20110725T230000Z/20110726T090000Z
			//FREEBUSY;FBTYPE=BUSY:20110725T150000Z/PT1H
			var validDate = /^([0-9]{4})([0-9]{2})([0-9]{2})([Tt]([0-2][0-9])([0-6][0-9])([0-9]{2}))?([Zz])?$/;
			var validDuration = /([-+])?P([0-9]+W)?([0-9]+D)?(T([0-9]+H)?([0-9]+M)?([0-9]+S)?)?/;
			if ( arguments[1] instanceof Object )
			{
				var props = arguments[1];
				if ( arguments[2] != undefined )
					p = arguments[2];
			}
			else if ( arguments.length > 1 )
				p = arguments[1];
			if ( typeof p == 'object' && p['type'] )
				var type = p['type'];
			else
				var type = 'BUSY';
			if ( this.DATA == undefined )
				this.DATA = {};
			if ( this.DATA[type] == undefined )
				this.DATA[type] = [];
			if ( this.FB == undefined )
			{
				this.FB = {};
				this.FB[type] = {};
			}
			else if ( this.FB[type] == undefined )
				this.FB[type] = {};
			var pieces = String(arguments[0]).split(',');
			for ( var i=0; i < pieces.length; i++ )
			{
				var parts = pieces[i].split('/'); 
				var start = Zero().parseDate(parts[0]); // should always start with a date
				var end;
				if ( validDate.test(parts[1]) ) // ends with a date
				{
					end = Zero().parseDate(parts[1]);
					if ( start > end )
					{
						if ( debug )
							console.log ( 'negative time period found parsing: ' + arguments[0] );
						continue; // negative time period
					}
				}
				else if ( validDuration.test(parts[1]) ) // ends with a duration
				{
					var duration = parseDuration(parts[1]);
					if ( duration.negative )
					{
						if ( debug )
							console.log ( 'negative time period found parsing: ' + arguments[0] );
						continue;  // negative time period 
					}
					end = new Date(start.getTime());
					end.addDuration(duration);
				}
				var length = end.getTime() - start.getTime();
				var triple = {type:type,start:start,end:end,length:length};
				if ( this.FB[type][start.getTime()] && this.FB[type][start.getTime()].length == length )
					continue;
				this.FB[type][start.getTime()] = triple;
				this.DATA[type].push(triple);
			}
		};
		this.SETDURATION = function (t,p)
		{
			if ( t.valid == undefined )
			{
				var v = t;
				var d = parseDuration(t);
			}
			else
			{
				var v = printDuration(t);
				var d = t;
			}
			if ( arguments.length > 1 )
				var props = arguments[1];
			if ( this.VALUES )
			{
				if ( props == undefined ) 
					props = null;
				if ( this.PROPS == undefined )
				{
					this.PROPS = new Array ;
					this.PROPS.push(this.PROP!=undefined?this.PROP:null);
				}
				if ( this.DURATIONS == undefined )
				{
					this.DURATIONS = new Array ;
					this.DURATIONS.push(this.DURATION!=undefined?this.DURATION:null);
				}
				if ( p && this.VALUES.indexOf(p) ) 
				{
					this.DURATIONS[this.VALUES.indexOf(p)] = d;
					this.VALUES[this.VALUES.indexOf(p)] = v;
					this.PROPS[this.VALUES.indexOf(p)] = props;
				}
				else
				{
					this.DURATIONS.push(d);
					this.VALUES.push(v);
					this.PROPS.push(props);
				}
			}
			else
			{
				if ( this.FIELDS && this.FIELDS.values )
					for ( var i in valueNames )
						if ( t == valueNames[i] )
							t = i;
				this.DURATION=d;
				this.VALUE=v;
				if ( props != undefined ) 
					this.PROP = props;
			}
		};
		this.UTCOFFSET = function (t)
		{
			t = t.replace ( /\\([\\.,;:])/g, '$1' );
			if ( arguments[1] instanceof Object )
			{
				var props = arguments[1];
				if ( arguments[2] != undefined )
					p = arguments[2];
				else
					p = props;
			}
			else if ( arguments.length > 1 )
				var props = arguments[1];
			if ( props )
				this.PROP = props;
			this.VALUE = t;
		};
		this.TRIGGER = function (s)
		{
			var dRX = /^([0-9]{4})([0-9]{2})([0-9]{2})([Tt]([0-2][0-9])([0-6][0-9])([0-9]{2}))?([Zz])?$/;
			if ( s instanceof Date || dRX.test ( s ) )
			{
				this.SETDATE.apply(this,arguments);
			}
			else
			{
				this.SETDURATION.apply(this,arguments);
			}
		};
		this.SETRECURRENCE = function (s)
		{ 
			if ( this.RECURRENCE == undefined )
				this.RECURRENCE = new recurrence;
			if ( String(s).match(/\s/) ) 
			{ 
				this.RECURRENCE.parsePrettyRecurrence(s); 
				this.VALUE = this.RECURRENCE.unparseRecurrence(); 
			}
			else 
			{ 
				this.VALUE =s; 
				this.RECURRENCE.parseRecurrence(s) 
			} 
		};
		this.TEXT = function (t,p)
		{
			t = t.replace ( /\\([\\.,;:])/g, '$1' );
			if ( arguments[1] instanceof Object )
			{
				var props = arguments[1];
				if ( arguments[2] != undefined )
					p = arguments[2];
				else
					p = props;
			}
			else if ( arguments.length > 1 )
				var props = arguments[1];
			if ( this.VALUES )
			{
				if ( props == undefined ) 
					props = null;
				if ( this.PROPS == undefined )
				{
					this.PROPS = new Array ;
					this.PROPS.push(this.PROP!=undefined?this.PROP:null);
				}
				if ( this.VALUES.length == 0  ) 
				{
					this.VALUES.push(this.VALUE);
					this.VALUES.push(t);
					this.PROPS.push(props);
				}
				if ( p && this.VALUES.indexOf(p) > -1 ) 
				{
					this.VALUES[this.VALUES.indexOf(p)] = t;
					this.PROPS[this.VALUES.indexOf(p)] = props;
				}
				else
				{
					this.VALUES.push(t);
					this.PROPS.push(props);
				}
			}
			else
			{
				if ( this.FIELDS && this.FIELDS.values )
					for ( var i in valueNames )
						if ( t == valueNames[i] )
							t = i;
				this.VALUE=t;
				if ( props != undefined ) 
					this.PROP = props;
			}
		};
		this.SCHEDULE = function (t,p)
		{
			t = t.replace ( /\\([\\.,;:])/g, '$1' );
			if ( arguments[1] instanceof Object )
			{
				var props = arguments[1];
				if ( arguments[2] != undefined )
					p = arguments[2];
				else
					p = props;
			}
			else if ( arguments.length > 1 )
				var props = arguments[1];
			if ( this.VALUES )
			{
				if ( props == undefined ) 
					props = null;
				if ( this.PROPS == undefined )
				{
					this.PROPS = new Array ;
					this.PROPS.push(this.PROP!=undefined?this.PROP:null);
				}
				if ( this.VALUES.length == 0  ) 
				{
					this.VALUES.push(this.VALUE);
					this.VALUES.push(t);
					this.PROPS.push(props);
				}
				else if ( p && this.VALUES.indexOf(p) > -1 ) 
				{
					this.VALUES[this.VALUES.indexOf(p)] = t;
					this.PROPS[this.VALUES.indexOf(p)] = props;
				}
				else
				{
					this.VALUES.push(t);
					this.PROPS.push(props);
				}
			}
			else
			{
				if ( this.FIELDS && this.FIELDS.values )
					for ( var i in valueNames )
						if ( t == valueNames[i] )
							t = i;
				this.VALUE=t;
				if ( props != undefined ) 
					this.PROP = props;
			}
		};
		this.INTEGER = function (t){this.VALUE=Number(t);}
		this.SEQUENCE = function (){this.VALUE=Number(this.VALUE)+1;}
		this.PRINT = {
			'integer':function(){return this.VALUE;},
			number:function(){return this.VALUE;},
			sequence:function(){return this.VALUE;},
			uri:function(){
				if ( arguments.length > 0 && this.VALUES && this.VALUES.length > 1 ) 
					var t = this.VALUES[arguments[0]]; 
				else 
					var t = this.VALUE; 
				if ( valueNames[t] )
					t = valueNames[t];
				if ( t != undefined )
				return t.replace(/\\[Nn]/g,"\n");},
			'utc-offset':function(){
				var t = this.VALUE; 
				if ( t != undefined )
				return t;},
			text:function(){
				if ( arguments.length > 0 && this.VALUES && this.VALUES.length > 1 ) 
					var t = this.VALUES[arguments[0]]; 
				else 
					var t = this.VALUE; 
				if ( valueNames[t] )
					t = valueNames[t];
				if ( t != undefined )
				return t.replace(/\\[Nn]/g,"\n");},
			period:function(){
				if ( arguments.length > 0 && this.VALUES && this.VALUES.length > 1 ) 
					var t = this.VALUES[arguments[0]]; 
				else 
					var t = this.VALUE; 
				if ( valueNames[t] )
					t = valueNames[t];
				if ( t != undefined )
				return t.replace(/\\[Nn]/g,"\n");},
			schedule:function(){
				if ( this.FIELD == 'organizer' && this.PROP && this.PROP['cn'] && this.PROP['cn'] != '' )
					return String(this.PROP['cn']).replace(/['"<>]/g,'');
				if ( arguments.length > 0 && this.VALUES && this.VALUES.length > 1 ) 
					var t = String(this.VALUES[arguments[0]]); 
				else 
					var t = String(this.VALUE); 
				if ( valueNames[t] )
					var t = String(valueNames[t]);
				if ( t != undefined )
				return t.replace(/\\[Nn]/g,"\n");},
			date:function(){
				if ( this.PROPS && this.PROPS.length > 1 )
				{
					if ( this.VALUES.indexOf(arguments[0]) ) var p = this.PROPS[this.VALUES.indexOf(arguments[0])];
					if ( this.VALUES[arguments[0]] ) var p = this.PROPS[arguments[0]];
				}
				else
					var p = this.PROP;
				if ( p == undefined || p['TZID'] == undefined )
					this.DATE.zulu = true;
				else
					this.DATE.zulu = false;
        if ( this.FIELD == 'due' && this.PROP['value'] != undefined )
        {
          this.SHORT = true;
          return this.DATE.prettyDate(true); // no time
        }
				if ( arguments.length > 0 && this.DATES.length > 1 ) 
					return this.DATES[arguments[0]].prettyDate(); 
				else 
					return this.DATE.prettyDate();},
			duration:function(){
				if ( arguments.length > 0 && this.VALUES && this.VALUES.length > 1 ) 
					var t = this.VALUES[arguments[0]]; 
				else 
					var t = this.VALUE; 
				return t;},
			trigger:function(){ if ( this.DATE ) return this.PRINT.date.apply(this,arguments);return this.PRINT.duration.apply(this,arguments);},
			recurrence:function(){if ( arguments[0] !== true ) var p = true; else var p = false;if (this.RECURRENCE == undefined ) return undefined ; else return this.RECURRENCE.toString(p);},
			props:function(){
				var line = '';
				if ( arguments.length > 0 && this.PROPS && this.PROPS.length > 1 )
				{
					if ( this.VALUES.indexOf(arguments[0]) ) var p = this.PROPS[this.VALUES.indexOf(arguments[0])];
					if ( this.VALUES[arguments[0]] ) var p = this.PROPS[arguments[0]];
				}
				else
					var p = this.PROP;
				if ( typeof p != "object" )
					return '';
				for ( var j in p )
					if ( j != j.toUpperCase() )
						line += ';' + j.toUpperCase() + '=' + this.ESCAPEPROP(p[j]);
				return line;
			}
		};
		this.ESCAPEPROP = function ( text ) {
			var t = text;
			t = t.replace ( /([^\\])([\\,;])/g, '$1\\$2' );
			if ( /:/.test(t) )
				t = '"'+t+'"';
			return t.replace ( /\n/g, '\\n' );
		};
		this.ESCAPE = function ( text ) {
			var t = String(text);
			if ( text == undefined )
				return;
			t = t.replace ( /([^\\])([\\,;])/g, '$1\\$2' );
			return t.replace ( /\n/g, '\\n' );
		};
		this.SERIALIZE = function ()
		{
			var ret = '';
			if ( this.VALUES && this.VALUES.length > 0 && ( this.FIELDS == undefined || ( this.FIELDS.max != 1 ) ) )
			{
				for ( var i = 0; i < this.VALUES.length; i++ )
				{
					line = this.FIELD.toUpperCase() + this.PRINT.props.apply(this,[i]) + ':';
					switch ( this.type )
					{
						case	'period':
							break;	
						case	'date':
							if ( this.PROPS[i] != undefined && this.PROPS[i]['tzid'] != undefined )
								this.DATES[i].zulu = false;
							else
								this.DATES[i].zulu = true;
							line = line + this.DATES[i].DateString() + "\n";
							break ;
						case	'recurrence':
							line = line + this.RECURRENCE.unparseRecurrence() + "\n";
							break ;
						case	'schedule':
							line = line + this.ESCAPE(this.VALUES[i]) + "\n";
							break ;
						case	'text':
							line = line + this.ESCAPE(this.VALUES[i]) + "\n";
							break ;
						default :
							line = line + this.ESCAPE(this.PRINT[this.type].apply(this,[i])) + "\n";
					}
					if ( line.length > 72 )
						for ( var z=72;z<line.length;z+=72)
							line = line.slice(0,z) + "\n " + line.slice(z);
					ret = ret + line;
				}
			}
			else
			{
				ret = ret + this.FIELD.toUpperCase() + this.PRINT.props.apply(this) + ':' ;
				switch ( this.type )
				{
					case	'period':
						break;	
					case	'date':
            if ( this.FIELD.toLowerCase() == 'due' || this.SHORT == true )
            {
              if ( this.PROP != undefined && this.PROP['value'] != undefined )
              {
                this.DATE.zulu = false;
                ret = ret + this.DATE.DayString() + "\n";
              }
              else
              {
                this.DATE.zulu = true;
                ret = ret + this.DATE.DateString() + "\n";
              }
            }
            else
            {
              if ( ( this.PROP != undefined && this.PROP['tzid'] != undefined ) || this.PARENT.tzname )
                this.DATE.zulu = false;
              else
                this.DATE.zulu = true;
              ret = ret + this.DATE.DateString() + "\n";
            }
						break ;
					case	'recurrence':
						ret = ret + this.RECURRENCE.unparseRecurrence() + "\n";
						break ;
					case	'schedule':
						ret = ret + this.ESCAPE(this.VALUE) + "\n";
						break ;
					case	'text':
						ret = ret + this.ESCAPE(this.VALUE) + "\n";
						break ;
					default :
						ret = ret + this.ESCAPE(this.PRINT[this.type].apply(this)) + "\n";
				}
				if ( ret.length > 72 )
					for ( var z=72;z<ret.length;z+=72)
							ret = ret.slice(0,z) + "\n " + ret.slice(z);
			}
			return ret;
		};
		this.UPDATE = function ()
		{
			switch ( this.type )
			{
				case 'trigger':
					var update = this.TRIGGER; 
					break;
				case 'date':
					var update = this.SETDATE; 
					break;
				case 'duration':
					var update = this.SETDURATION; 
					break;
				case 'recurrence':
					var update = this.SETRECURRENCE;
					break;
				case 'utc-offset':
					var update = this.UTCOFFSET;
					break;
				case 'schedule':
					var update = this.SCHEDULE;
					break;
				case 'period':
					var update = this.PERIOD; 
					break;
				case 'integer':
				case 'number':
					var update = this.INTEGER; 
					break;
				default: // default to text
					var update = this.TEXT; 
					break;
			}
			if ( this.FIELDS && this.VALUES == undefined && this.FIELDS.max !=1 && this.VALUE )
			{
				this.VALUES = new Array ;
				update.apply(this,arguments);
			}
			else
				update.apply(this,arguments);
			if ( this.VALUES )
				this.length = this.VALUES.length;
			else
				this.length = 1;
			this.propertyIsEnumerable('length',false);
			if ( this.PARENT != undefined )
				this.PARENT.UPDATED = true;
		};
		if ( ! this.type && arguments.length < 2 ) return ; 
		if (arguments.length == 1 && typeof arguments[0] == "boolean" ) return this.toString(arguments[0]); 
		return this[this.type.toUpperCase()](arguments);
	};

	this.newField = function ()
	{
		var args = Array.prototype.slice.call(arguments);
		var f = args.shift();
		var a = new this.UPDATEx ;
		//a.VALUE=args[0];
		if ( f && this.fields[f.toLowerCase()] )
		{
			a.type = this.fields[f.toLowerCase()].type;
			a.FIELDS = this.fields[f.toLowerCase()];
			a.propertyIsEnumerable('FIELDS',false);
		}
		else
			a.type = 'text';
		a.FIELD = f;
		if ( a.PRINT[a.type] != undefined )
			a.toString = a.PRINT[a.type];
		else
			a.toString = a.PRINT['text'];
		a.propertyIsEnumerable('type',false);
		a.propertyIsEnumerable('FIELD',false);
		if ( args.length > 0 )
			a.UPDATE(args[0],args[1],args[2],args[3]);
		return a;
	}

	if ( ! text || text == 'vevent' )
		text = this.icsTemplateVevent ;
	else if ( text == 'vtodo' ) 
		text = this.icsTemplateVtodo ;
	else if ( text == 'vjournal' ) 
		text = this.icsTemplateVjournal ;
	this.ics = this.parseiCal( text );
	this.length = this.ics.length;
	this.index = {};
	this.recurrence = [];
	for ( var i in this.ics )
	{
		this.ics[i]['PARENT'] = this;
		this.ics[i]['INDEX'] = i;
		this.ics[i]['DELETE'] = function () { this.PARENT.length--; delete this.PARENT.ics[this.INDEX]; };
		if ( this.ics[i].TYPE == 'vevent' )
		{
			if ( this.ics[i].vcalendar.vevent.rrule != undefined )
				this.recurrence.push(this.ics[i]);
			else
			{
				if ( this.index[this.ics[i].vcalendar.vevent.dtstart.DATE.YM()] == undefined )
					this.index[this.ics[i].vcalendar.vevent.dtstart.DATE.YM()] = [];
				this.index[this.ics[i].vcalendar.vevent.dtstart.DATE.YM()].push(this.ics[i]);
			}
		}
	}

	return this;
};

///////////////////////////////////////////////////////////////////////
//                Recurrence Handling

var recurrence = function ( text )
{
	this.rrule_expansion = {
		'YEARLY':{ type:'y', 'BYMONTH':'expand', 'BYWEEKNO':'expand', 'BYYEARDAY':'expand', 'BYMONTHDAY':'expand','BYDAY':'expand', 'BYHOUR':'expand', 'BYMINUTE':'expand', 'BYSECOND':'expand' },
		'MONTHLY':{ type:'m', 'BYMONTH':'limit', 'BYMONTHDAY':'expand','BYDAY':'expand', 'BYHOUR':'expand', 'BYMINUTE':'expand', 'BYSECOND':'expand' },
		'WEEKLY':{ type:'W', 'BYMONTH':'limit','BYDAY':'expand', 'BYHOUR':'expand', 'BYMINUTE':'expand', 'BYSECOND':'expand' },
		'DAILY':{ type:'d', 'BYMONTH':'limit', 'BYMONTHDAY':'limit','BYDAY':'limit', 'BYHOUR':'expand', 'BYMINUTE':'expand', 'BYSECOND':'expand' },
		'HOURLY':{ type:'h', 'BYMONTH':'limit', 'BYMONTHDAY':'limit','BYDAY':'limit', 'BYHOUR':'limit', 'BYMINUTE':'expand', 'BYSECOND':'expand' },  
		'MINUTELY':{ type:'M', 'BYMONTH':'limit', 'BYMONTHDAY':'limit','BYDAY':'limit', 'BYHOUR':'limit', 'BYMINUTE':'limit', 'BYSECOND':'expand' },
		'SECONDLY':{ type:'s', 'BYMONTH':'limit', 'BYMONTHDAY':'limit','BYDAY':'limit', 'BYHOUR':'limit', 'BYMINUTE':'limit', 'BYSECOND':'limit' } };
	
	this.editRecurrence = function()
	{
		var dowa = ['SU','MO','TU','WE','TH','FR','SA'];
		var dow = {SU:'Sunday',MO:'Monday',TU:'Tuesday',WE:'Wednesday',TH:'Thursday',FR:'Friday',SA:'Saturday'};
		if ( this.rule == undefined ) 
			return false ;
		var r = this.rule;
		var ret = r.FREQ.replace(/LY$/,'') ;
		var inter = '';
		if ( typeof ( r['INTERVAL'] ) != "undefined"  && r.INTERVAL != 1 )
			inter = r.INTERVAL;
		ret = '<span class="recurrence"><span class="repeat" contenteditable="true" text="'+recurrenceUI['every']+' ">'+inter+'</span><span class="every" contenteditable="true">'+recurrenceUI[ret]+'</span>';
		if ( r.COUNT )
		{
			ret = ret + '<span class="foruntil" contenteditable="true">' + recurrenceUI['for'] + '</span><span class="value" data-value="'+
				Number(r.COUNT).toLocaleString() + ' ' + recurrenceUI['time'+ (r.COUNT>1?'s':'')] + 
				'" contenteditable="true">' + Number(r.COUNT).toLocaleString() + ' ' + recurrenceUI['time'+ (r.COUNT>1?'s':'')] + '</span>'; 
		}
		else if ( r.UNTIL ) 
		{
			ret = ret + '<span class="foruntil" contenteditable="true">' + recurrenceUI['until'] + '</span><span class="value" data-value="' + r.UNTIL.prettyDate() +
				'" contenteditable="true">' + r.UNTIL.prettyDate() + '</span>'; 
		}
		else
			ret = ret + '<span class="foruntil" contenteditable="true">' + valueNames.NONE + '</span><span class="value" contenteditable="true"></span>';
		ret = ret +  '</span>';
		var ret = $(ret);
		$(ret).append(this.printSections(r.FREQ));
		$(ret).data('rule',this);
		//$('.repeat',ret).bind('focus', function (e){ });
		$('.every',ret).bind('focus', function (e){
			var freq = ['YEAR','MONTH','WEEK','DAI','HOUR','MINUTE','SECOND'];
			var comp = buildOptions({target:e.target,options:freq,text:recurrenceUI, none:true, spaceSelects:true, search:false,removeOnEscape:false, 
				callback: function (e) {
					for ( var j in recurrenceUI ) 
						if ( recurrenceUI[j] == $(e).text() )
							break;
					var freq = j;
					var txt = $(e).parent().data('rule').printSections(freq+'LY');
					$(e).parent().children('.byrule').replaceWith($(txt));
				}
			});
			popupOverflowVisi();
			if ( ! $(e.target).prev().hasClass('completionWrapper') )
				$(e.target).before(comp);
		});
		$('.foruntil',ret).bind('focus', function (e){
			$(e.target).data('value',$(e.target).next().text());
			var comp = buildOptions({target:e.target,options:['for','until'],text:recurrenceUI, none:true,spaceSelects:true ,search:false ,removeOnEscape:true, callback:function (e){
				if ( $(e).text() == '' )
					return $(e).text(valueNames.NONE).next().empty();
				if ( $(e).text() == recurrenceUI['for'] )
				{
					var tRE = new RegExp ( recurrenceUI['time'] );
					var val = Number(1).toLocaleString() + ' ' + recurrenceUI['time'];
				}
				if ( $(e).text() == recurrenceUI['until'] )
				{
					var tRE = /([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4})\s*(([0-2]?[0-9]):?([0-6][0-9])?:?([0-6][0-9])?\s*([AP]M)?)?/i;
					var d = $($($('#wcal').data('popup')).data('event')).attr('instance');
					var val = Zero().parseDate(d).prettyDate() ;
				}
				if ( tRE.test($(e).next().data('value') ) )
				{	
					if ( $(e).next().data('value') != $(e).next().text() )
						$(e).next().text( $(e).next().data('value') );
				}
				else
						$(e).next().text( val );
			}});
			popupOverflowVisi();
			$(e.target).before(comp);
		});
		$(ret).bind('focusin focusout',function(){$(this).toggleClass('focus')});
		return ret;
	};

	this.printSections = function (f)
	{
		var r = this.rule;
		var ret = '';
		for ( var i in this.rrule_expansion[f] )
		{
			if ( i == 'type' ) 
				continue ;
			var type = String(i).replace(/BY/,'');
			if ( type == 'DAY' )
				type = 'DAI';
			ret = ret + '<div class="byrule"><span class="label '+ String(i).toLowerCase() +'" expand="'+ this.rrule_expansion[f][i] +'" >'+recurrenceUI[type]+'</span><span class="value" contenteditable="true">';
			var values = '';
			if ( r[i] != undefined )
			{
				var p = r[i];
				if ( p.length == undefined )
					continue;	
				for ( var j = 0; j < p.length; j++ )
					values = values + (j>0?ui.listSeparator+' ':'') + this.printByValue(i, p[j]);
			}
			ret = ret + values + '</span></div>';
		}
		var ret = $(ret);
		$('.bymonth + .value',ret).bind('focus', function (e){
			var m = [0,1,2,3,4,5,6,7,8,9,10,11];
			var comp = buildOptions({target:e.target,options:m,text:months, none:true, spaceSelects:true, search:true,removeOnEscape:true,multiselect:ui.listSeparator+' '} );
			popupOverflowVisi();
			if ( ! $(e.target).prev().hasClass('completionWrapper') )
				$(e.target).before(comp);
		});
		$('.byday + .value',ret).bind('focus', function (e){
			var m = [0,1,2,3,4,5,6];
			var comp = buildOptions({target:e.target,options:m,text:weekdays, none:true, spaceSelects:true, search:true,removeOnEscape:true,multiselect:ui.listSeparator+' '} );
			popupOverflowVisi();
			if ( ! $(e.target).prev().hasClass('completionWrapper') )
				$(e.target).before(comp);
		});
		return ret;
	};

	this.printByValue = function ( type, value )
	{
		var dowa = {'SU':0,'MO':1,'TU':2,'WE':3,'TH':4,'FR':5,'SA':6};
		switch ( type )
		{ 
			case 'BYMONTH':
				return months[value-1];
			case 'BYDAY':
				var offset = String(value).match ( /([-+]?[0-9]+)?([a-zA-Z]{2})/ );
				var o = '';
				if ( offset[1] != undefined )
				{
					o = recurrenceUI['position'+(Number(offset[1])+6)];
				}
				return o + ' ' + weekdays[ dowa[ offset[2] ] ];
			case 'BYWEEKNO':
			case 'BYYEARDAY':
			case 'BYMONTHDAY':
			case 'BYHOUR':
			case 'BYMINUTE':
			case 'BYSECOND':
				return value;
		}
	};

	this.prettyRecurrence = function()
	{
		var dowa = ['SU','MO','TU','WE','TH','FR','SA'];
		var dow = {SU:'Sunday',MO:'Monday',TU:'Tuesday',WE:'Wednesday',TH:'Thursday',FR:'Friday',SA:'Saturday'};
		if ( this.rule == undefined ) 
			return false ;
		var r = this.rule;
		var ret = r.FREQ.replace(/LY$/,'') ;
		ret = recurrenceUI[ret];
		if ( r.COUNT ) ret = recurrenceUI['every'] + ' ' + ret + ' ' + recurrenceUI['for'] + ' ' + r.COUNT + ' ' + recurrenceUI['time'+ (r.COUNT>1?'s':'')];
		if ( r.UNTIL ) ret = recurrenceUI['every'] + ' ' + ret + ' ' + recurrenceUI['until'] + ' ' + (new Date()).parseDate(r.UNTIL).prettyDate();
		if ( ! r.COUNT && ! r.UNTIL ) ret = recurrenceUI['every'] + ' ' + ret;
		return ret;
	};
	
	this.parsePrettyRecurrence = function(r)
	{ 
		var dowa = ['SU','MO','TU','WE','TH','FR','SA'];
		if ( this.rule == undefined ) 
			this.rule = {'FREQ':'YEARLY'};
		var n = {};
		if ( $('.repeat',r).text() != '' )
		{
			var res = String($('.repeat',r).text()).match(/(\d+)/);
			if ( ! res )
				return false;
			if ( Number(res[1]) != 1 )
			n.INTERVAL = Number(res[1]);
		}
		for ( var j in recurrenceUI ) 
			if ( recurrenceUI[j] == $('.every',r).text() )
				break;
		n.FREQ = j + 'LY';
		if ( $('.foruntil',r).text() == recurrenceUI['for'] )
		{
			var res = String($('.foruntil + .value',r).text()).match(/(\d+)/);
			if ( ! res )
				return false;
			var num = Number(res[1]);
			if ( num == NaN )
				false;
			n.COUNT = num;
		}
		else if ( $('.foruntil',r).text() == recurrenceUI['until'] )
			n.UNTIL = Zero().parsePrettyDate($('.foruntil + .value',r).text());
		
		var sep = new RegExp ( "\\s*"+ui.listSeparator+"\\s*" );
		for ( var i in this.rrule_expansion[n.FREQ] )
		{
			var type = String(i).replace(/BY/,'');
			var val = $.trim($( '.' + String(i).toLowerCase() + ' + .value' ,r).text());
			if ( val != '' )
				n[i] = val;
			else 
				continue;
			if ( i == 'BYDAY' )
			{
				var a = [];
				var parts = n[i].split(sep);
				for ( var j = 0 ; j < parts.length; j++ ) 
					a.push(dowa[weekdays.indexOf(parts[j])]);
				n[i]=a;
			}
			if ( i == 'BYMONTH' )
			{
				var a = [];
				var parts = n[i].split(sep);
				for ( var j = 0 ; j < parts.length; j++ ) 
					a.push(months.indexOf(parts[j]));
				n[i]=a;
			}
		}
		this.rule = n;
		if ( this.occurences != undefined )
		{
			delete this.occurrences;
			delete this.until;
			delete this.start;
		}
	};
	
	this.parseRecurrence = function(r)
	{
		var dowa = ['SU','MO','TU','WE','TH','FR','SA'];
		this.text = r;
		var S = String(r);
		var freqr = /(SECONDLY|MINUTELY|HOURLY|DAILY|WEEKLY|MONTHLY|YEARLY)/;
		var byr = /(BYSECOND|BYMINUTE|BYHOUR|BYDAY|BYMONTHDAY|BYYEARDAY|BYWEEKNO|BYMONTH|BYSETPOS)/;
		var parts = S.split(';');
		var res = new Array;
		var rule = new Object;
		for ( var i=0; i<parts.length;i++)
		{
			var c = parts[i].split('=');
			values = [];
			if ( byr.test(c[0]) )
				values = c[1].split(',');
			else
				values = [c[1]];
			rule[c[0]] = new Array ();
			switch ( c[0] )
			{
				case 'BYSECOND':
					for ( var j=0; j<values.length; j++)
						if ( values[j] >=0 && values[j] <=60 )
							rule[c[0]].push ( values[j] );
					break ;
				case 'BYMINUTE':
					for ( var j=0; j<values.length; j++)
						if ( values[j] >=0 && values[j] <=59 )
							rule[c[0]].push ( values[j] );
					break ;
				case 'BYHOUR':
					for ( var j=0; j<values.length; j++)
						if ( values[j] >=0 && values[j] <=23 )
							rule[c[0]].push ( values[j] );
					break ;
				case 'BYDAY':
					for ( var j=0; j<values.length; j++)
						if ( /^([+-]?([1-4][0-9]|5[0-3]|[1-9]))?(SU|MO|TU|WE|TH|FR|SA)$/.test(values[j]) )
							rule[c[0]].push ( values[j] );
					break ;
				case 'BYMONTHDAY':
					for ( var j=0; j<values.length; j++)
						if ( values[j] > -32 && values[j] != 0 && values[j] < 32 )
							rule[c[0]].push ( values[j] );
					break ;
				case 'BYYEARDAY':
					for ( var j=0; j<values.length; j++)
						if ( values[j] > -366 && values[j] != 0 && values[j] < 366 )
							rule[c[0]].push ( values[j] );
					break ;
				case 'BYWEEKNO':
					for ( var j=0; j<values.length; j++)
						if ( values[j] > -53 && values[j] != 0 && values[j] < 53 )
							rule[c[0]].push ( values[j] );
					break ;
				case 'BYMONTH':
					for ( var j=0; j<values.length; j++)
						if ( values[j] > 0 && values[j] < 13 )
							rule[c[0]].push ( values[j] );
					break ;
				case 'BYSETPOS':
					for ( var j=0; j<values.length; j++)
						if ( values[j] > -366 && values[j] != 0 && values[j] < 366 )
							rule[c[0]].push ( values[j] );
					break ;
				case 'WKST':
					if ( values.length == 1 && /^(SU|MO|TU|WE|TH|FR|SA)$/.test(values[0]) )
						rule[c[0]] = values[0];
					break ;
				case 'FREQ':
					if ( values.length == 1 && freqr.test(values[0]) )
						rule[c[0]] = values[0];
					break ;
				case 'INTERVAL':
					if ( values.length == 1 && values[0] > 0 ) 
						rule[c[0]] = Number ( values[0] );
					break ;
				case 'COUNT':
					if ( values.length == 1 && values[0] > 0 ) 
						rule[c[0]] = Number ( values[0] );
					break ;
				case 'UNTIL':
					if ( values.length == 1 && Zero().parseDate(values[0])  ) 
						rule[c[0]] = Zero().parseDate(values[0]);
					break ;
			}
		}
		if ( rule.BYWEEKNO !=undefined && rule.FREQ != 'YEARLY' )
			delete rule.BYWEEKNO;
		if ( rule.BYYEARDAY !=undefined && ( rule.FREQ == 'DAILY' || rule.FREQ == 'WEEKLY' || rule.FREQ == 'MONTHLY' ) )
			delete rule.BYYEARDAY;
		if ( rule.BYMONTHDAY !=undefined && rule.FREQ == 'WEEKLY' )
			delete rule.BYMONTHDAY;

		this.rule = rule;
		if ( this.occurences != undefined )
		{
			delete this.occurences;
			delete this.start;
			delete this.until;
		}
	};
	
	this.unparseRecurrence = function(r)
	{
		//var freqr = /(SECONDLY|MINUTELY|HOURLY|DAILY|WEEKLY|MONTHLY|YEARLY)/;
		var byr = /(BYSECOND|BYMINUTE|BYHOUR|BYDAY|BYMONTHDAY|BYYEARDAY|BYWEEKNO|BYMONTH|BYSETPOS)/;
		if ( this.rule == undefined ) 
			return false ;
		var parts = this.rule;
		var rule = new String ;
		for ( var i in parts )
		{
			if ( rule.length > 1 )
				rule = rule + ';';
			if ( i == 'UNTIL' )
				rule = rule +  i + '=' + parts[i].DateString();
			else if ( parts[i].join )
				rule = rule +  i + '=' + parts[i].join(',');
			else
				rule = rule +  i + '=' + parts[i];
		}
		this.text = rule;
		return this.text;
	};
	
	this.expandRecurrence  = function( s, u )
	{
		var dow = {SU:0,MO:1,TU:2,WE:3,TH:4,FR:5,SA:6};
		var Adj = { 'BYMONTH':-1, 'BYWEEKNO':0, 'BYYEARDAY':0, 'BYMONTHDAY':0, 'BYDAY':0, 'BYHOUR':0, 'BYMINUTE':0, 'BYSECOND':0, 'BYSETPOS':0 };
		var occurences = new Array ();
		if ( this.rule == undefined ) 
			return ;
		var r = this.rule;
		var fulldate = true;
		var hms = s.match(/([0-9]{4})([0-9]{2})([0-9]{2})([Tt]([0-2][0-9])([0-6][0-9])([0-9]{2}))?[Zz]?/).slice(1);
		if ( hms[3] != undefined  )
		{
			var s = new Date ( ); //hms[0],(hms[1]-1),hms[2],hms[4],hms[5],hms[6] );
			s.setUTCFullYear(hms[0]);
			s.setUTCMonth(hms[1]-1);
			s.setUTCDate(hms[2]);
			s.setUTCHours(hms[4]);
			s.setUTCMinutes(hms[5]);
			s.setUTCSeconds(hms[6]);
			s.setMilliseconds(0);
			var order = { 'BYMONTH':'m', 'BYWEEKNO':'w', 'BYYEARDAY':'Y', 'BYMONTHDAY':'m', 'BYDAY':'D', 'BYHOUR':'h', 'BYMINUTE':'M', 'BYSECOND':'s', 'BYSETPOS':'p' };
			var Set = { 'BYMONTH':'setUTCMonth', 'BYWEEKNO':'setWeek', 'BYYEARDAY':'setDayOfYear', 'BYMONTHDAY':'setUTCDate', 'BYDAY':'setDayOfWeek', 'BYHOUR':'setUTCHours', 'BYMINUTE':'setUTCMinutes', 'BYSECOND':'setUTCSeconds', 'BYSETPOS':'p' };
		}
		else
		{
			var s = new Date ( ); //hms[0],(hms[1]-1),hms[2] );
			s.setUTCFullYear(hms[0]);
			s.setUTCMonth(hms[1]-1);
			s.setUTCDate(hms[2]);
			s.setUTCHours(0);
			s.setUTCMinutes(0);
			s.setUTCSeconds(0);
			s.setMilliseconds(0);
			fulldate = false;
			var order = { 'BYMONTH':'m', 'BYWEEKNO':'w', 'BYYEARDAY':'Y', 'BYMONTHDAY':'m', 'BYDAY':'D', 'BYSETPOS':'p' };
			var Set = { 'BYMONTH':'setUTCMonth', 'BYWEEKNO':'setWeek', 'BYYEARDAY':'setDayOfYear', 'BYMONTHDAY':'setUTCDate', 'BYDAY':'setDayOfWeek', 'BYHOUR':'setUTCHours', 'BYMINUTE':'setUTCMinutes', 'BYSECOND':'setUTCSeconds', 'BYSETPOS':'p' };
		}
		if ( ! s instanceof Date )
			return false ;
		var d = new Date ( s );
		occurences[d.getTime()] = new Date(d);
		var end = false ;
		var limit = false ;
		var freq = r.FREQ ;
		if ( this.rrule_expansion[freq] == undefined || this.rrule_expansion[freq].length < 2 )
		{
			console.log('frequency ' + freq + ' not found' );
			return occurences;
		}
		var count = 100, until = '', interval = 1, c = 0,dummy=0;
		if ( r.COUNT    ) count     = r.COUNT;
		if ( r.INTERVAL ) interval  = r.INTERVAL;
		if ( r.UNTIL    ) until     = r.UNTIL;
			else if ( u instanceof Date ) until = u;
			else until = dateAdd(new Date(),'y',20);
		if ( r.WKST     ) wkst      = r.WKST;
		if ( this.start == s && this.until.getTime() == until.getTime() )
			return this.occurences;
		for ( var c = 1;c < count &&! end; dummy++ )
		{
			var nextd = new Date(d);
			var loopoccurences = new Array ();
			for ( var i in order )
			{
				if ( end ) break ;
				if ( r[i] != undefined )
				{
					limit = false;
					if ( i == 'BYSETPOS' )
					{
						var previousoccurences = loopoccurences;
					}
					if ( this.rrule_expansion[freq][i] == 'limit' ) 
					{
						limit = true;
						loopoccurences = new Array ();
					}
					for (var z=0;z<r[i].length&&c<count&&!end;z++)
					{ 
						if ( i == 'BYDAY' )
						{
							var offset = r[i][z].match ( /([-+]?[0-9]+)?([a-zA-Z]{2})/ );
							if ( ( freq == 'YEARLY' && r.BYMONTH != undefined ) || freq == 'MONTHLY' ) // special by day rules for monthly
							{
								if ( limit == false )
								{
									loopoccurences = new Array ();
									limit = true;
								}
								if ( offset[1] != undefined )
								{
									d.setUTCDate(1);
									if ( offset[1] < 0 ) 
									{
										d.add ( 'm' , 1).setUTCDate(-1);
										d.setUTCDate(offset[1]*7);
									}
									else
										d.setUTCDate(offset[1]*7-6);
									d.add ( order[i], dow[offset[2]]  );
								}
								else
									d.add ( order[i], dow[offset[2]]  );
								if ( c >= count || d > until ) end = true;
								else loopoccurences[d.getTime()] = new Date(d.getTime());
							}
							else if ( offset[1] == undefined || freq != 'YEARLY' || ( r['BYWEEKNO'] != undefined && freq == 'YEARLY' ) ) 
							{
								if ( limit == false )
								{
									loopoccurences = new Array ();
									limit = true;
								}
								if ( d.getDayOfWeek() > dow[offset[2]] )
									d.add('W',1);
								d[Set[i]]( dow[offset[2]] );
								if ( c >= count || d > until ) end = true;
								else loopoccurences[d.getTime()] = new Date(d.getTime());
							}
							else
							{ // integer modifier only valid on YEARLY and MONTHLY frequencies
								d.setUTCDate(1);
								var m = d.getUTCMonth();
								var nd = new Date(d);
								var t = true;
								while ( t ) 
								{
									nd[Set[i]] ( dow[offset[2]] );
									if ( m == nd.getUTCMonth() )
									{
										d = new Date(nd);
										nd.add('W',1);
										if ( c >= count || d > until ) end = true;
										else loopoccurences[d.getTime()] = new Date(d.getTime());
									}
									else
										t = false;
								}
							}
						}
						else if ( i == 'BYSETPOS' )
						{
							var a = previousoccurences.length,inc=0;
							for ( var b in previousoccurences )
							{
								if ( inc == r[i][z] && r[i][z] > 0 )
									loopoccurences[b] = previousoccurences[b];
								if ( (a - inc) == r[i][z] && r[i][z] < 0 )
									loopoccurences[b] = previousoccurences[b];
								inc++;
							}
						}
						else if ( this.rrule_expansion[freq][r[i]] == 'expand' )
						{
							var sd = new Date(d);
							var ed = new Date(sd).add(order[i],1);
							while ( d < ed && ! end )
							{
								d.add(order[i], Number(r[i][z]) + Adj[i] );
								if ( c >= count || d > until ) end = true;
								else loopoccurences[d.getTime()] = new Date(d.getTime());
							}
						}
						else
						{
							d[Set[i]]( Number(r[i][z]) + Adj[i] );
							if ( c >= count || d > until ) end = true;
							else loopoccurences[d.getTime()] = new Date(d.getTime());
						}
					}
				}
				if ( c >= count || d > until ) end = true;
			}
			for ( var b in loopoccurences )
			{
				if ( occurences[b] == undefined && c < count )
				{
					c++;
					occurences[b] = loopoccurences[b];
				}
			}
	
			d = dateAdd ( nextd, this.rrule_expansion[freq].type, interval );
			if ( c >= count || d > until ) end = true;
			else if ( ! limit ) 
			{ 
				c++;
				occurences[d.getTime()] = d;
			}
		}
		this.start = s;
		this.until = until;
		this.occurences = occurences;
		return occurences;
	};
	
	this.toString = function (p){ return p?this.prettyRecurrence():this.text; };

	if ( text )
	{
		if ( /\s/.test ( text ) )
			this.parsePrettyRecurrence( text );
		else
			this.parseRecurrence( text );
	}
	return this;
};

function guid()
{ 
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
				    return v.toString(16);
						}).toUpperCase();
}


