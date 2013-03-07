$(function(){
  if (!Modernizr.inputtypes.date){
    $('input[type=date]').datepicker({
      'dateFormat': 'yy-mm-dd'
    });
  }
});