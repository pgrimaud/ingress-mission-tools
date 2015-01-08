var missions = new Array();
var loop = 0;

$('.mission').each(function(){
  missions[loop] = new Array();
  var name = $('.info .mission-title-published',this).html();
  if(name === undefined){
    return;
  }
  missions[loop]['name'] = name;
  missions[loop]['img'] = $('img',this).attr('src');
  missions[loop]['submitted'] = $('.info .mission-time-published',this).html();
  missions[loop]['order'] = $('.mission-type span',this).html();
  
  var x = 1;
  
  $('.mission-type .stats-number.ng-binding',this).each(function(){
    if(x == 1){
      missions[loop]['time'] = $(this).html()
    }else if(x == 2){
      missions[loop]['rating'] = $(this).html()
    }else if(x == 3){
      missions[loop]['completed'] = $(this).html()
    }
    x++;
  });
  
  loop++;  
});

console.log(missions)