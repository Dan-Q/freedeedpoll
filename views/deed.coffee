$ ->
  $('.has-popover').popover().css('cursor', 'help').click ->
    return false

  $('.hero-unit').on 'click', 'a.remote', ->
    $(this).closest('.remote-container').load $(this).attr('href'), ->
      $('.wizard-panel').find('input:visible:first').focus()
    return false

  $('.hero-unit').on 'click', 'a.btn-next', ->
    $(this).closest('.wizard-panel').find('.control-group').removeClass('error')
    $(this).closest('.wizard-panel').find('.alert').remove()

    valid = true
    validity = for input in $('input.required:visible')
      if $.trim($(input).val()) == ''
        $(input).closest('.control-group').addClass('error').before("<div class='alert'>#{$(input).attr('placeholder')} is required.</div>")
        valid = false
    if !valid then $('.wizard-panel.current .control-group.error:first input:visible:first').focus(); return false

    $(this).closest('.wizard-panel').removeClass('current').next('.wizard-panel').addClass('current').find('input:visible:first').focus()
    if $(this).hasClass('btn-skip-one-if-blank') && $(this).closest('.control-group').find('input').val() == '' then $('a.btn-next:visible:first').click()
    return false

  $('.hero-unit').on 'click', 'a.btn-prev', ->
    $(this).closest('.wizard-panel').removeClass('current').prev('.wizard-panel').addClass('current').find('input:visible:first').focus()
    return false

  $('.hero-unit').on 'keypress', 'input', (event)->
    if (event.which == 13)
      $('.btn-primary:visible:first').click()
      return false

  $('#view-deed-poll-icon').css('cursor', 'pointer').click ->
    $('#view-deed-poll').click()
