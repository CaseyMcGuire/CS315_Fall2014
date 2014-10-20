$(document).ready(function(){ //make sure page is loaded

  //save
  $('#save_keyframe_button').click(function(){
    var time;
    do{
        time = parseFloat(prompt("Enter a keyframe time (in seconds)"));
    }while(isNaN(time) || time > 100 || time < 1);

    save_keyframe(time);
      $('#keyframes').html(JSON.stringify(animations));
  });

  //play
  $('#play_button').click(function(){
      
    play_animation();
  });

  //load
 $('#load_anim_button').click(function(){
    var filepath = 'assets/'+$('#anim_file_input').val()+'.json';
     console.log(filepath);
    var json = Utils.loadJSON(filepath);
     console.log(json);
    var animation = {};
    for(var timekey in json)
    {
      animation[timekey] = {};
      for (var bodyPart in json[timekey])
      {
        var vals = json[timekey][bodyPart];
        animation[timekey][bodyPart] = quat.fromValues(vals[0],vals[1],vals[2],vals[3]);
      }
    }
    load_animation(animation);
  });

   

   


});
