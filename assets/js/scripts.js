$(function() {

    // VARIABLES

    var API = "https://api.themoviedb.org/3";
    var KEY = "4ba13f07eb7d66f818df7d9bf080d2e8";
    var URL_IMAGE = "http://image.tmdb.org/t/p/";
    var BACKDROP = URL_IMAGE + "original";
    var POSTER = URL_IMAGE + "w342";
    
    var getMovies = API + "/discover/movie" + "?api_key=" + KEY + "&language=pt-br";
    var getTV = API + "/discover/tv" + "?api_key=" + KEY + "&language=pt-br";
    var getFamily = getMovies + "&with_genres=10751";

    // AJAX

    $.ajax(getMovies).done(function(res){
        mountFeatured(res.results);  
        res.results.shift();
        mountCarousel(res.results, "#movies-slider");
    });

    $.ajax(getTV).done(function(res){
        mountCarousel(res.results, "#series-slider");
    });

    $.ajax(getFamily).done(function(res){
        mountCarousel(res.results, "#family-slider");
    });

    // INTERACTIONS

    $(".movies-list__slider").slick({
        variableWidth: true,
        prevArrow: '<button type="button" class="slick-prev"><i class="fas fa-chevron-left"></i></button>',
        nextArrow: '<button type="button" class="slick-next"><i class="fas fa-chevron-right"></i></button>'
    });

    $("#play-featured, .movies-list__slider").click(function(e) {
        var idMedia, type;

        if ($(this).data("id")) {
            idMedia = $(this).data("id");
            type = $(this).data("type");
        } else {
            idMedia = $(e.target).closest("[data-id]").data("id");
            type = $(e.target).closest("[data-type]").data("type");
        };

        if (idMedia) {
            $("#modal").fadeIn();
            setTimeout(function() {
                $("#wrap").addClass("blur");
            }, 200)
            $("body").css("overflow", "hidden")
    
            $.ajax(API + "/" + type + "/" + idMedia + "?api_key=" + KEY + "&language=pt-br")
                .done(function(res){
                    mountModal(res);
            });
        };
    });

    $("#close-modal").click(function() {
        $("#modal").fadeOut();
        setTimeout(function() {
            $("#wrap").removeClass("blur");
        }, 200)
        $("body").css("overflow", "auto")
    });

    $("#modal .modal__poster").click(function(res) {

        var type = $(this).attr("data-type");
        var id = $(this).attr("data-id");

        $.ajax(API + "/" + type + "/" + id + "/videos?api_key=" + KEY + "&language=pt-br")
            .done(function(res) {
                $("#player").fadeIn();
                if (res.results[0]) {
                    console.log(res.results.length);
                    var idVideo = res.results[0].key;
                    
                    var video = '<iframe src="https://www.youtube.com/embed/' + idVideo + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    
                    $("#player .player-content").html(video);
                    $("#player iframe").css("width", window.innerWidth).css("height", window.innerHeight);
                } else {
                    $("#player .player-content").html("<h3>Vídeo indisponivel :(</h3>");
                    console.log(res.results[0]);
                }
            });
    });

    $("#close-player").click(function() {
        $("#player").fadeOut();
    });    
    
    window.addEventListener("resize", function() {
        $("#player iframe").css("width", window.innerWidth).css("height", window.innerHeight);
    });
    
    //    LOADER
    
    $(document).ajaxComplete(function(){
        setTimeout(function(){
            $("#loading").fadeOut();
        }, 300)
    });

    $(document).ajaxStart(function(){
        $("#loading").fadeIn();
    });
    
    //    FUNCTIONS
    
    function mountFeatured(movies) {
        var featured = movies[0];
        var title = featured.title;
        var vote = featured.vote_average;
        var backdrop = BACKDROP + featured.backdrop_path;
        var id = featured.id;
        
        $("#backdrop").css("background-image", "url("+backdrop+")");
        $("#featured-title").text(title);
        $("#featured-vote").text(vote);
        $("#play-featured").attr("data-id", id).attr("data-type", "movie");
    };

    function mountCarousel(list, slider) {
        list.forEach(function(item) {
            var title = item.title ? item.title : item.name;
            var poster = POSTER + item.poster_path;
            var vote = item.vote_average;
            var id = item.id;
            var type = item.name ? "tv" : "movie";

            var template = '<div class="movies-list__item" data-id='+id+' data-type='+type+'>';
                template += '<img src="' + poster + '">';
                template += '<div class="movies-list__action">';
                template += '<i class="far fa-play-circle"></i>';
                template += '<h3>' + title + '</h3>';
                template += '<div class="rating">';
                template += '<div class="rating__score">'+ vote +'</div>';
                template += '</div>';
                template += '</div>';
                template += '</div>';

            $(slider).slick("slickAdd", template);
        });
    };

    function mountModal(media) {

        var isTv = !!media.name;
        var poster = POSTER + media.poster_path;
        var title = isTv ? media.name : media.title;
        var original_title = isTv ? "" : media.original_title
        var overview = media.overview;
        var vote = media.vote_average;
        var runtime = isTv ? media.number_of_seasons+" temporada(s)" : media.runtime+" min";
        var homepage = media.homepage;
        var iconRuntime = isTv ? "fas fa-tv" : "far fa-clock"; 
        var id = media.id;

        $("#modal .modal__poster").attr("data-id", id).attr("data-type", isTv ? "tv" : "movie");
        $("#modal .modal__poster img").attr("src", poster);
        $("#modal h2").html(title);
        $("#modal h4").html(original_title);
        $("#modal p").html(overview);
        $("#modal .rating__score").html(vote);
        $("#modal .modal__runtime span").html(runtime);
        $("#modal .modal__runtime i").removeClass().addClass(iconRuntime);
        $("#modal a").html(homepage).attr("href", homepage);

    };
});