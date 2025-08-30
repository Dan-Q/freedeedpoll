export default async function(eleventyConfig) {
  eleventyConfig.setInputDirectory('views');

  eleventyConfig.addWatchTarget('./js/');

  eleventyConfig.addShortcode('copyright', ()=>`
    &copy; Copyright 2011 - ${new Date().getFullYear()}
    <a href="https://danq.me/">Dan Q</a>
  `);
};
