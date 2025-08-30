export default async function(eleventyConfig) {
  eleventyConfig.setInputDirectory('views');

  eleventyConfig.addWatchTarget("./js/");
};
