const carousel = document.querySelectorAll('.carousel');
for (let post of carousel) {
	var flkty = new Flickity(post, {
		imagesLoaded: true,
		percentPosition: false
	});
	var imgs = post.querySelectorAll('.carousel-cell img');
	var docStyle = document.documentElement.style;
	var transformProp = typeof docStyle.transform == 'string' ? 'transform' : 'WebkitTransform';
}

flkty.on('scroll', function() {
	flkty.slides.forEach(function(slide, i) {
		var img = imgs[i];
		var x = (slide.target + flkty.x) * -1 / 3;
		img.style[transformProp] = 'translateX(' + x + 'px)';
	});
});
