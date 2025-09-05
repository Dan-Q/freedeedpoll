# Free Deed Poll

A modern tool to produce PDF and HTML deeds poll that can be used by British citizens to legally change their name.
Runs entirely in the browser.

## Usage

To use the site online, just:

1. Go to https://freedeedpoll.org.uk/
2. Provide your details
3. Print off the PDF
4. Sign it and have two witnesses sign it
5. Send it off to everybody who needs to know your new name!

To use it on your own computer, follow the development instructions below.

## Development

### Development dependencies

- NodeJS v18+

### Setting up a development environment

1. Check out this repository
2. Run `npm i` to install dependencies
3. Run `npm start` to run a development server
4. Visit http://localhost:8080/

## Deployment

### Build for deployment

From your development environment, run `npm run build`. The generated site will be output into the
`_site` directory as a static site. Upload this onto virtually any web host.

### Deploying to GitHub Pages

There's a defined workflow that deploys to GitHub Pages. If forking the repository, you'll need to modify
`views/CNAME.njk` to specify your own domain name.

## Contributing

Issues and pull requests are very welcome. Please observe the code of conduct.

## License

Free and open-source software under the AGPL.
