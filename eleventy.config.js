import * as esbuild from 'esbuild'

export default async function(eleventyConfig) {
  eleventyConfig.setInputDirectory('views');

  // Compile JS with ESBuild
  eleventyConfig.addWatchTarget('./js/');
	eleventyConfig.addTemplateFormats('js');
	eleventyConfig.addExtension('js', {
		outputFileExtension: 'js',
		compile: async function (inputContent) {
			return async (data) => {
        let result = await esbuild.build({
          entryPoints: [data.page.inputPath],
          outfile: data.page.outputPath,
          bundle: true,
          minify: false,
        });
        return result.code;
      };
		},
	});
  eleventyConfig.addShortcode('copyright', ()=>`
    &copy; Copyright 2011 - ${new Date().getFullYear()}
    <a href="https://danq.me/">Dan Q</a>
  `);
};
