freedeedpoll
============

If you simply want to make yourself a free UK Deed Poll document, there's a hosted version of
this application at http://www.freedeedpoll.org.uk/ - go to that web site, fill in the form,
print your Deed Poll, sign it... and you're done!

Requirements
------------

This project requires prawn version 0.11.1.pre or higher.

    gem install prawn --pre

It also requires sinatra, jpoz-sinatra-recaptcha, haml, and (in development mode), sinatra-reloader

    gem sources -a http://gems.github.com
    gem install sinatra jpoz-sinatra-recaptcha haml sinatra-reloader

The site will probably only work on a *nix-based server, as a result of it's clunky calls.

Configuration
-------------

The service is "ready-to-run" (see Running, below), but you might like to look at two pieces
of configuration first:

1. reCAPTCHA

To reduce the potential for abuse of your service, you might like to enable reCAPTCHA (if you're
just setting it up for yourself, there's no need). To do this, rename the provided
recaptcha.configuration.rb.example file to recaptcha.configuration.rb and adjust it to contain
a valid ReCaptcha public and private key. You can get these from
https://www.google.com/recaptcha/admin/

2. Fonts

This version of freedeedpoll uses Olde English (http://www.dafont.com/olde-english.font) and
Linux Libertine (http://www.dafont.com/linux-libertine.font) free fonts. You're able to
customise this by replacing the fonts in the lib/fonts directory and changing the references
in the deed.rb script.

Running
-------

To run in development mode:

    ruby deed.rb

To run in production mode, deploy onto your server. This has been tested only using Phusion
Passenger on Apache as a deployment platform.

License
-------

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see http://www.gnu.org/licenses/.
