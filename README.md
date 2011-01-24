freedeedpoll
============

If you simply want to make yourself a free UK Deed Poll document, there's a hosted version of
this application at http://www.freedeedpoll.org.uk/ - go to that web site, fill in the form,
print your Deed Poll, sign it... and you're done!

Requirements
------------

This project requires prawn version 0.11.1.pre or higher.

    gem install prawn --pre

It also requires sinatra, jpoz-sinatra-recaptcha, and (in development mode), sinatra-reloader

    gem sources -a http://gems.github.com
    gem install sinatra jpoz-sinatra-recaptcha sinatra-reloader

The site will probably only work on a *nix-based server, as a result of it's clunky calls.

Configuration
-------------

Rename the provided recaptcha.configuration.rb.example file to recaptcha.configuration.rb
and adjust it to contain a valid ReCaptcha public and private key. You can get these
from https://www.google.com/recaptcha/admin/

To run in development mode:

    ruby deed.rb

To run in production mode, deploy onto your server. This has been tested only using Phusion
Passenger on Apache as a deployment platform.

The live version of the site uses nonfree fonts. You will need to supply your own fonts in
the lib/fonts directory and reference them appropriately from the deed.rb script before use.

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
