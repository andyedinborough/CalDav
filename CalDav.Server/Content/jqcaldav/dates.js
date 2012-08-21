///////////////////////////////////////////////////////////////////////
//                Timezone Handling

var zones = function ( )
{
	this.initialized = false;
	this.adjustIntoTZ = function ( d )
	{

	};
	this.init = function ()
	{
		this.initialized = true;
		this.daylight = {};
		this.standard = {};
		this.Dstart = {};
		this.Sstart = {};
		var a = arguments[0];
		if ( ! a.tzid && a[0].tzid )
			a = a[0];
		this.tzid = a.tzid.toString();
		var today = new Date();
		var year2 = new Date().add('y',2);
		if ( a.daylight.length )
		{
			for ( var i = 0; i< a.daylight.length; i++ )
			{
				if ( a.daylight[i].rrule instanceof recurrence )
				{
					var o = a.daylight[i].rrule.expandRecurrence(a.daylight[i].dtstart,year2);
					for ( var j in o )
					{
						this.Dstart[i[j].getUTCFullYear()] = i;
					}
					this.daylight[i] = {begin:a.daylight[i].dtstart,end:o[o.length-1],offset:a.daylight[i].tzoffsetto.VALUE};
				}
				else
				{	
					console.log( a);
					//this.daylight[i] = {begin:a.daylight[i].dtstart,offset:a.daylight[i].tzoffsetto.VALUE};
					//this.Dstart[a.daylight[i].dtstart.DATE.getUTCFullYear()] = i;
				}
			}
		}
		else
		{	
			this.daylight[0] = {begin:a.daylight.dtstart,offset:a.daylight.tzoffsetto.VALUE};
			this.Dstart[a.daylight.dtstart.DATE.getUTCFullYear()] = 0;
		}
	
		if ( a.standard.length )
		{
			for ( var i = 0; i< a.standard.length; i++ )
			{
				if ( a.standard[i].rrule instanceof recurrence )
				{
					var o = a.standard[i].rrule.expandRecurrence(a.standard[i].dtstart,year2);
					for ( var j in o )
					{
						this.Sstart[i[j].getUTCFullYear()] = i;
					}
					this.standard[i] = {begin:a.standard[i].dtstart,end:o[o.length-1],offset:a.standard[i].tzoffsetto.VALUE};
				}
				else
				{	
					console.log( a);
					//this.standard[i] = {begin:a.standard[i].dtstart,offset:a.standard[i].tzoffsetto.VALUE};
					//this.Sstart[a.standard[i].dtstart.DATE.getUTCFullYear()] = i;
				}
			}
		}
		else
		{	
			this.standard[0] = {begin:a.standard.dtstart,offset:a.standard.tzoffsetto.VALUE};
			this.Sstart[a.standard.dtstart.DATE.getUTCFullYear()] = 0;
		}
	};
	if ( arguments[0] )
	{
		if ( this.initialized )
			this.adjustIntoTZ( arguments );
		else
			this.init( arguments );
	}
};


///////////////////////////////////////////////////////////////////////
//                Expanded Date Handling

Date.prototype.pad = function (n){return n<10 ? '0'+n : n};

Date.prototype.TimeString = function(){
	return this.getUTCHours() + '' 
      + this.pad(this.getUTCMinutes()) + ''
			+ this.pad(this.getUTCSeconds())};

Date.prototype.DayString = function(){
	return this.getUTCFullYear() + '' 
      + this.pad(this.getUTCMonth()+1) + '' 
      + this.pad(this.getUTCDate())};

Date.prototype.LocalDayString = function(){
	return this.getFullYear() + '' 
      + this.pad(this.getMonth()+1) + '' 
      + this.pad(this.getDate())};

Date.prototype.DateString = function(){
	return this.getUTCFullYear() + ''
      + this.pad(this.getUTCMonth()+1) + ''
      + this.pad(this.getUTCDate())+'T'
      + this.pad(this.getUTCHours()) + ''
      + this.pad(this.getUTCMinutes()) + ''
      + this.pad(this.getUTCSeconds()) +
			(this.zulu?'Z':'') };

Date.prototype.LocalDateString = function(){
	return this.getFullYear() + ''
      + this.pad(this.getMonth()+1) + ''
      + this.pad(this.getDate())+'T'
      + this.pad(this.getHours()) + ''
      + this.pad(this.getMinutes()) + ''
      + this.pad(this.getSeconds())};

Date.prototype.DateStringZ = function(){
	return this.getUTCFullYear() + ''
      + this.pad(this.getUTCMonth()+1) + ''
      + this.pad(this.getUTCDate())+'T'
      + this.pad(this.getUTCHours()) + ''
      + this.pad(this.getUTCMinutes()) + ''
      + this.pad(this.getUTCSeconds())+'Z'};

Date.prototype.prettyTime = function(){
	return settings.twentyFour?this.prettyTime24():this.prettyTime12();};

Date.prototype.prettyTime24 = function(){
	return this.getUTCHours() + ':' 
      + this.pad(this.getUTCMinutes()) };

Date.prototype.prettyTime12 = function(){
	return (this.getUTCHours()==12||this.getUTCHours()==0?12:(this.getUTCHours()>11?this.getUTCHours()-12:this.getUTCHours()))
      + (this.getUTCMinutes()==0?'':':'+this.pad(this.getUTCMinutes())) + ' '
			+ (this.getUTCHours()>11?'PM':'AM')};

Date.prototype.prettyDate = function(short){
	return this.pad(this.getUTCMonth()+1)+'/'
      + this.pad(this.getUTCDate())+'/'
      + this.getUTCFullYear()+' '
			+ (short===true?'':this.prettyTime())}

function emptyDuration ()
{
	return {years:0,months:0,weeks:0,days:0,hours:0,minutes:0,seconds:0,negative:false,valid:false};
}

function toDuration(msecs)
{
	// TODO fix handling across DST boundaries and years(esp leapyears)
	var t = Math.abs(msecs+0);
	var dur = emptyDuration();
	dur.valid = true;
	if ( msecs < 0 )
	{
		dur.negative = true;
	}
	//year 30758400000 = 356 * 24 * 60 * 60 * 1000
	dur.years = Math.floor(t/30758400000);
	t-=30758400000*dur.years;
	// TODO handle months?
	//weeks 604800000 = 7 * 24 * 60 * 60 * 1000
	dur.weeks = Math.floor(t/604800000);
	t-=604800000*dur.weeks;
	//days 86400000 = 24 * 60 * 60 * 1000
	dur.days = Math.floor(t/86400000);
	t-=86400000*dur.days;
	//hours 3600000 = 60 * 60 * 1000
	dur.hours = Math.floor(t/3600000);
	t-=3600000*dur.hours;
	//minutes 60000 = 60 * 1000
	dur.minutes = Math.floor(t/60000);
	t-=60000*dur.minutes;
	//seconds 1000
	dur.seconds = Math.floor(t/1000);
	t-=1000*dur.seconds;
	return dur;
}

function durationToSeconds ( dur )
{
  var secs = 0;
  secs += 30758400000*dur.years +
    604800000*dur.weeks +
    86400000*dur.days +
    3600000*dur.hours +
    60000*dur.minutes +
    1000*dur.seconds;
  return parseInt ( secs / 1000 )
}

function parseDuration(dur)
{
	var years = /([1-9][0-9]*)[\s\t.,=_;@:-]*years?/i;
	var months = /([1-9][0-9]*)[\s\t.,=_;@:-]*months?/i;
	var weeks = /([1-9][0-9]*)[\s\t.,=_;@:-]*w(eeks?)?/i;
	var days = /([1-9][0-9]*)[\s\t.,=_;@:-]*d(ays?)?/i;
	var hours = /([.1-9][.0-9]*)((?=:)[0-9]{2})?[\s\t.,=_;@-]*h(ours?)?/i;
	var minutes = /([1-9][0-9]*)[\s\t.,=_;@:-]*m(inutes?)?/i;
	var seconds = /([1-9][0-9]*)[\s\t.,=_;@:-]*s(econds?)?/i;
	var neg = /(^-P?|before)/;
	var validDuration = /([-+])?P([0-9]+W)?([0-9]+D)?(T([0-9]+H)?([0-9]+M)?([0-9]+S)?)?/;
	var s,y,m,w,d,h,M,S,n;
  s= String(dur);
  y = 0;
  m = 0;
  w = 0;
  d = 0;
  h = 0;
  M = 0;
  S = 0;
	if ( s.match ( validDuration ) )
	{
		var r = s.match ( validDuration );
    y = 0;
    m = 0;
    n = r[1]==undefined?false:true;
    w = r[2]==undefined?0:parseInt(r[2])+0;
    d = r[3]==undefined?0:parseInt(r[3])+0;
    h = r[5]==undefined?0:parseInt(r[5])+0;
    M = r[6]==undefined?0:parseInt(r[6])+0;
    S = r[7]==undefined?0:parseInt(r[7])+0;
	  return {years:y,months:m,weeks:w,days:d,hours:h,minutes:M,seconds:S,negative:n,valid:true};
	}
	if ( s.match ( neg ) )
		var n = true;
	else 
		var n = false;
	if ( s.match ( years ) )
		var y = Number ( s.match ( years )[1]);
	if ( s.match ( months ) )
		var m = Number ( s.match ( months )[1]);
	if ( s.match ( weeks ) )
		var w = Number ( s.match ( weeks )[1]);
	if ( s.match ( days ) )
		var d = Number ( s.match ( days )[1]);
	if ( s.match ( hours ) )
		var h = Number ( s.match ( hours )[1]);
	if ( s.match ( minutes ) )
		var M = Number ( s.match ( minutes )[1]);
	if ( s.match ( seconds ) )
		var S = Number ( s.match ( seconds )[1]);
	return {years:y,months:m,weeks:w,days:d,hours:h,minutes:M,seconds:S,negative:n,valid:false};
}

function printDuration(dur)
{
	if ( dur.valid == undefined )
		return dur;
	var ret = '';
	if ( dur.negative == true )
		ret = '-';
	ret = ret + 'P';
	if ( dur.weeks && dur.weeks != 0 )
		ret = ret + dur.weeks + 'W';
	if ( dur.days && dur.days != 0 )
		ret = ret + dur.days + 'D';
	var time = '';
	if ( dur.hours && dur.hours != 0 )
		time = time + dur.hours + 'H';
	if ( dur.minutes && dur.minutes != 0 )
		time = time + dur.minutes + 'M';
	if ( dur.seconds && dur.seconds != 0 )
		time = time + dur.seconds + 'S';
	if ( time.length > 0 )
		ret = ret + 'T' + time;
	return ret;
}

Date.prototype.addDuration  = function( duration )
{
	var start = new Date ( this.getTime() );
	if ( duration['years'] != undefined )
		var dur = duration;
	else
		var dur = parseDuration ( duration );
	var map = {years:'y',months:'m',weeks:'w',days:'d',hours:'h',minutes:'M',seconds:'S'};
	for ( var x in dur )
	{
		if ( map[x] != undefined && ( dur[x] > 0 || dur[x] < 0 ) )
			this.add ( map[x], dur[x] );
	}
	if ( dur.negative == true )
		this.setTime ( start.getTime() - ( this.getTime() - start.getTime() ) );
	return this;
};

Date.prototype.parseDate  = function( d )
{
	var dRX = /([0-9]{4})([0-9]{2})([0-9]{2})([Tt]([0-2][0-9])([0-6][0-9])([0-9]{2}))?([Zz])?/;
	this.setUTCMilliseconds(0);
	var parts = String(d).match( dRX ).slice(1);
	if ( parts[3] != undefined  )
	{
		this.setUTCFullYear(parts[0]);
		this.setUTCMonth(parts[1]-1);
		this.setUTCDate(parts[2]);
		this.setUTCHours(parts[4]);
		this.setUTCMinutes(parts[5]);
		this.setUTCSeconds(parts[6]);
		this.setUTCMilliseconds(0);
		this.zulu = parts[7];
	}
	else
	{
		this.setUTCFullYear(parts[0]);
		this.setUTCMonth(parts[1]-1);
		this.setUTCDate(parts[2]);
		this.setUTCHours(0);
		this.setUTCMinutes(0);
		this.setUTCSeconds(0);
		this.setUTCMilliseconds(0);
		this.zulu = parts[7];
	}
	return this;
};

Date.prototype.parsePrettyTime = function(d){
	this.setUTCMilliseconds(0);
	var dRX = /\s*(([0-2]?[0-9]):?([0-6][0-9])?\s*([AP]M)?)?/i;
	var parts = String(d).match( dRX ).slice(1);
	if ( parts[3] != undefined  )
	{
		this.setUTCHours(parts[3].match(/am/i)?(parts[1]==12?0:parts[1]):(parts[1]-0+12));
		this.setUTCMinutes(parts[2]==undefined?0:parts[2]); 
	}
	else
	{
		this.setUTCHours(parts[1]);
		this.setUTCMinutes(parts[2]==undefined?0:parts[2]); 
	}
	return this;
};

Date.prototype.parsePrettyDate = function(d,zero){
	if ( zero )
	{
		this.setUTCHours(0);
		this.setUTCMinutes(0);
		this.setUTCSeconds(0);
		this.setUTCMilliseconds(0);
	}
	var dRX = /([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4})\s*(([0-2]?[0-9]):?([0-6][0-9])?:?([0-6][0-9])?\s*([AP]M)?)?/i;
  if ( String ( d ) == '' )
    throw 'error in date string';
  try {
	  var parts = String(d).match( dRX ).slice(1);
  }catch (e){ 
    throw 'error in date string'; }
	if ( parts[3] != undefined )
	{
		this.setUTCFullYear(parts[2]);
		this.setUTCMonth(parts[0]-1);
		this.setUTCDate(parts[1]);
		this.setUTCHours(parts[7]!=undefined?(parts[7].match(/pm/i)?(parts[4]<12?(parts[4]-0+12):12):(parts[4]==12?0:parts[4])):parts[4]);
		this.setUTCMinutes(parts[5]==undefined?0:parts[5]);
		this.setUTCSeconds(parts[6]||0);
	}
	else
	{
		this.setUTCFullYear(parts[2]);
		this.setUTCMonth(parts[0]-1);
		this.setUTCDate(parts[1]);
	}
	return this;
};

function Zero (d)
{
	if ( !d )
		var d = new Date();
	d.setUTCMonth(0);
	d.setUTCDate(1);
	d.setUTCHours(0);
	d.setUTCMinutes(0);
	d.setUTCSeconds(0);
	d.setUTCMilliseconds(0);
	return d;
}

Date.prototype.YM = function (){ var d = Zero(); d.setUTCMonth(this.getUTCMonth()); d.setUTCFullYear(this.getUTCFullYear()); return d; };
Date.prototype.YW = function (){ var d = Zero(); d.setUTCMonth(this.getUTCMonth()); d.setUTCFullYear(this.getUTCFullYear()); d.setUTCDate(this.setUTCDate());d.setUTCDate(this.getUTCDate()); d.setDayOfWeek(this.WeekStart); return d; };
Date.prototype.localTzApply = function(){ var adj = localTimezone.offset * 60/100 * 60; this.setTime( this.getTime() + adj *1000); return this; };
Date.prototype.localTzRemove = function(){ var adj = localTimezone.offset * 60/100 * 60; this.setTime( this.getTime() - adj *1000); return this; };
Date.prototype.getLongMinutes = function(){return this.getUTCHours() * 100 + this.getUTCMinutes() * (100/60);};
Date.prototype.Zero = function (){ Zero(this); return this; };
Date.prototype.ZeroTime = function (){ this.setUTCHours(0); this.setUTCMinutes(0); this.setUTCSeconds(0); this.setUTCMilliseconds(0); return this; };
Date.prototype.WeekStart = new Number(0);
Date.prototype.setWeekStart = function ( Day ) { this.WeekStart = new Number(Day); return this; };
Date.prototype.getWeekStart = function ( ) { return this.WeekStart; };
Date.prototype.getWeek = function ( ) { var w = 0, t = new Date(this);t.setUTCDate(1); t.setUTCMonth(0); if (t.getDay()<this.WeekStart)w--;while (t<this&&w<53) {t.setUTCDate(t.getUTCDate()+7);w++;}  return w; };
Date.prototype.setWeek = function ( Week ) { var t = new Date(this); var w=t.getWeek(); this.setUTCDate((Week-w)*7); return this; };
Date.prototype.getDayOfYear = function ( ) { var w = 0, t = new Date(this);t.setUTCDate(1); t.setUTCMonth(0); while (t<this&&w<366) {t.setUTCDate(t.getUTCDate()+1);w++;}  return w; };
Date.prototype.setDayOfYear = function ( Day ) { var w=0;this.setUTCDate(1); this.setUTCMonth(0); while (w<Day&&w<366) {this.setUTCDate(this.getUTCDate()+1);w++;}  return this; };
Date.prototype.getDaysInMonth = function ( ) { var t = new Date(this); t.setUTCMonth(t.getUTCMonth()+1); t.setUTCDate(-1);return t.getUTCDate(); };
Date.prototype.getWeekInMonth = function ( ) { return Math.ceil(t.getUTCDate()/7); };
Date.prototype.setDayOfWeek = function (Day) { this.setUTCDate(this.getUTCDate()-this.getUTCDay());var t=this.getUTCDate();this.setUTCDate(t+Day); return this; };
Date.prototype.getDayOfWeek = function (Day) { var d = this.getUTCDay(); return d; };

function dateAdd ( d, field, amount )
{ // y = year, m = month, W = weeks, w = week number, d = day of month(25), D = day of week (3) -> wed, h = hour, M = minute, s = Second
	var ret = new Date ( d.getTime() );
	var amount = Number(amount);
  if ( String(amount) == 'NaN' )
    return ret;
	switch ( field )
	{
		case 'y':
		case 'year':
			ret.setUTCFullYear(d.getUTCFullYear()+amount);
			break ;
		case 'm':
		case 'month':
			ret.setUTCMonth(d.getUTCMonth()+amount);
			break ;
		case 'W':
		case 'Week':
			ret.setUTCDate(d.getUTCDate()+(7*amount));
			break ;
		case 'w':
		case 'weeks':
			ret.setWeek(d.getWeek()+amount);
			break ;
		case 'd':
		case 'days':
			ret.setUTCDate(d.getUTCDate()+amount);
			break ;
		case 'D':
		case 'Day':
		case 'day':
			ret.setUTCDate(d.getUTCDate()-d.getDay());
			if ( ( d.getDay() <= amount && amount >= 0 ) || amount < 0 )
				ret.setUTCDate(ret.getUTCDate()+amount);
			else
				ret.setUTCDate(ret.getUTCDate()+amount+7);
			break ;
		case 'h':
		case 'hour':
			ret.setUTCHours(d.getUTCHours()+amount);
			break ;
		case 'M':
		case 'Minute':
		case 'minute':
			ret.setUTCMinutes(d.getUTCMinutes()+amount);
			break ;
		case 's':
		case 'seconds':
			ret.setUTCSeconds(d.getUTCSeconds()+amount);
			break ;
		default :
	}
	return ret ;
}

Date.prototype.add = function ( field, amount ){ this.setTime( dateAdd( this, field, amount ).getTime() ); return this; };

