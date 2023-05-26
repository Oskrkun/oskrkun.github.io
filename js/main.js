  jQuery(document).ready(function(){ 
	
	/* ---------------------------------------------------------------------- */
	/*	Custom Functions
	/* ---------------------------------------------------------------------- */

	// Logo
	var $logo 	= $('#logo');

    if (location.href.indexOf("#") != -1) {
        $logo.show();
    }
	// Show logo 
	$('.menu .tabs a').click(function() {
	  $logo.fadeIn('slow');
	});
	// Hide logo
	$('.tab-profile').click(function() {
	  $logo.fadeOut('slow');
	});	

	
	
	
	/* ---------------------------------------------------------------------- */
	/*	Resume
	/* ---------------------------------------------------------------------- */
	
	// Rating bars
	$(".skills li .rating").each(function(index,e) { 

		// Vars
		var 
			$ratNum = 7,
			$rat = $(e).attr("data-rat"),
			$point = "<span></span>";

		// Append points
		while($ratNum > 0){
		     $(e).append($point);
		     $ratNum--;
		}

		$(e).find("span").each(function(index,e) { 
			if(index >= $rat) return false;
			// Append Disabled Rats
			$(e).animate({
			    opacity: 1
			  });
		});

    });

	/* ---------------------------------------------------------------------- */
	/*	About
	/* ---------------------------------------------------------------------- */
	
	// Profile Photo Slider
	 $(".photo-inner ul").carouFredSel({
        direction           : "left",
 	    circular: true,
        auto    			: true,
        scroll 			: {
            items           : 1,
            fx 				: 'crossfade',
            duration        : 1500,                        
            wipe    		: true
        },
	    swipe: {
	        onTouch: true
	    },
        items: {
            width: 153
        }           
    });
	 
	/* ---------------------------------------------------------------------- */
	/*	Menu
	/* ---------------------------------------------------------------------- */
	
	// Needed variables
	var $content 		= $("#content");
	
	// Run easytabs
  	$content.easytabs({
	  animate			: true,
	  updateHash		: false,
	  transitionIn		:'slideDown',
	  transitionOut		:'slideUp',
	  animationSpeed	:600,
	  tabs				:".tmenu",
	  tabActiveClass	:'active',
	});

	
	// Hover menu effect
	$content.find('.tabs li a').hover(
		function() {
			$(this).stop().animate({ marginTop: "-7px" }, 200);
		},function(){
			$(this).stop().animate({ marginTop: "0px" }, 300);
		}
	);

	// Menu Navigation
	 $(".menu .tabs").carouFredSel({
        responsive          : true,
        direction           : "left",
 	    circular: false,
    	infinite: false,
        pagination  		: "#menu-controls",  
        auto    			: false,
        scroll 			: {
            items           : 1,
            duration        : 300,                        
            wipe    : true
        },
		prev	: {	
			button	: "#menu-prev",
			key		: "right"
		},
		next	: { 
			button	: "#menu-next",
			key		: "left"
		},
	    swipe: {
	        onTouch: true
	    },
        items: {
            width: 140,
            visible: {
              min: 2,
              max: 5
            }
        }           
    });
	/* ---------------------------------------------------------------------- */
	/*	Cats Filter
	/* ---------------------------------------------------------------------- */ 
	
	var $catsfilter 		= $('.cats-filter');

	// Copy categories to item classes
	$catsfilter.find('a').click(function() {
		var currentOption = $(this).attr('data-filter');
		$(this).parent().parent().find('a').removeClass('current');
		$(this).addClass('current');
	});	

	/* ---------------------------------------------------------------------- */
	/*	Portfolio
	/* ---------------------------------------------------------------------- */ 
	
	// Needed variables
	var $plist	 	= $('#portfolio-list');
	var $pfilter 		= $('#portfolio-filter');
		
	// Run Isotope  
	$plist.isotope({
		filter				: '*',
		layoutMode   		: 'masonry',
		animationOptions	: {
		duration			: 750,
		easing				: 'linear'
	   }
	});	
	
	
	// Isotope Filter 
	$pfilter.find('a').click(function(){
	  var selector = $(this).attr('data-filter');
		$plist.isotope({ 
		filter				: selector,
		animationOptions	: {
		duration			: 750,
		easing				: 'linear',
		queue				: false,
	   }
	  });
	  return false;
	});	


	

	let $btns = $('.project-area .button-group button');


    $btns.click(function (e) {

        $('.project-area .button-group button').removeClass('active');
        e.target.classList.add('active');

        let selector = $(e.target).attr('data-filter');
        $('.project-area .grid').isotope({
            filter: selector
        });
        return false;
    })

    $('.project-area .button-group #btn1').trigger('click');
	
	
	
	
	//Rotate Img in random Value and Zoom in Hover (add transform rotate en css)
	$('.project-area .grid .our-project .img img').hover(function() {
        var a = Math.random() * 10 - 5;
        $(this).css('transform', 'rotate(' + a + 'deg) scale(1.25)');
    }, function() {
		//exit hover restar transform
        $(this).css('transform', 'none');
    });
	
	//aun no funciona con esto
	var forceIsotope = document.getElementById("forceIsotope");
	
	forceIsotope.addEventListener('click', function(){
		
		console.log("Hola");
		$('.project-area .grid').isotope({
            filter: "*"
        });
		
	})
	
	
	
	/* ---------------------------------------------------------------------- */
	/*	Certificates
	/* ---------------------------------------------------------------------- */ 

	//Cambiar Color con Boton
	let $btnConfig = $('.socials-text .pulse-button');
	
	
	$btnConfig.click(function (e) {
		
		switch (this.id) {
			case "amarillo":
				$(':root').css('--mainColor', color = "#c5d239");
				$(':root').css('--colorCertificates', color = "#212529");
			break;
			case "rojo":
				$(':root').css('--mainColor', color = "#cf455c");
				$(':root').css('--colorCertificates', color = "#212529");
			break;
			case "azul":
				$(':root').css('--mainColor', color = "#4a43ca");
				$(':root').css('--colorCertificates', color = "#e8e8e8");
			break;
			case "verde":
				$(':root').css('--mainColor', color = "#4faa4a");
				$(':root').css('--colorCertificates', color = "#212529");
			break;
			case "violeta":
				$(':root').css('--mainColor', color = "#7e047e");
				$(':root').css('--colorCertificates', color = "#e8e8e8");
			break;
			default:
				$(':root').css('--mainColor', color = "#cf455c");
				$(':root').css('--colorCertificates', color = "#212529");
			break;
		}
		
		//cambio random entre los colores del array
		//$(':root').css('--mainColor', (color = ["#c5d239", "#cf455c", "#4a43ca", "#4faa4a","purple"])[Math.floor(Math.random() * color.length)]);

        return false;
    })

});	