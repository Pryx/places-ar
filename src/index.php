<?php
/*This constant is replaced by build system*/
define('PLACES_AR_VER', '1.0.0');
?>
<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <title>Places AR Demo</title>
  <meta name="description" content="">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

  <link rel="manifest" href="site.webmanifest">
  <link rel="apple-touch-icon" href="icon.png">

  <link rel="stylesheet" href="css/normalize.css">
  <link rel="stylesheet" href="css/main.css">
</head>

<body>
  <!--
    Places AR is an experimental web app that aims to provide users with means to locate places using Augmented Reality. 
    The HTML is not that much documented, but the main sections are outlined by HTML comments. Enjoy :)
  -->

  <!--
    Nobody should be using IE on mobile... :)
  -->
  <!--[if IE]>
    <p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="https://browsehappy.com/">upgrade your browser</a> to improve your experience and security.</p>
  <![endif]-->

  <noscript>
    <!--
      We do not work without JS, so warn anyone with it disabled
    -->
    <section id="nojs" class="wizard">
      <div class="wizard-wrapper">
        <div class="slide slide-nr0">
          <div class="padded-wrap">
            <h2>Javascript disabled!</h2>
            <p>This app needs javascript to work properly. Please enable it and try again.</p>
            <a class="btn btn-next error" href="./">Reload</a>
          </div>
        </div>
      </div>
    </section>
  </noscript>

  <main id="main">
    <!--
      The compass and compass marker displaying azimuth
    -->
    <div id="compass">
      <div class="compass-slider">
        <div class="compass-segment">
          <div class="compass-mark">N</div>
        </div>
        <div id="compass-icon" class="compass-icon" style="left: 45%;display: none;">
          <img src="img/map-pin-white.svg" alt="Map">
        </div>
        <div class="compass-segment">
          <div class="compass-mark">E</div>
        </div>
        <div class="compass-segment">
          <div class="compass-mark">S</div>
        </div>
        <div class="compass-segment">
          <div class="compass-mark">W</div>
        </div>
      </div>
    </div>

    <!-- Basic information about selected place (name, distance and distance accuracy) -->
    <section id="place-info">No place selected yet</section>

    <!-- Notice to get user to rotate to landscape if portrait is used -->
    <div id="rotate_screen">
      <div class="rotate-wrapper">
        <h2>Please rotate your screen to landscape mode</h2>
        <img src="img/rotate.svg" alt="rotate">
      </div>
    </div>

    <!-- Camera feed with container that is used for Firefox hack (problem with changing aspect ratio in FullScreen) -->
    <div class="video-container">
      <video id="video" width="100%" height="100%" autoplay class="hide" autoplay playsinline></video>
    </div>

    <!-- Notice that is shown when video feed is not playing -->
    <div id="insufficient-permissions">
      <div class="vertically-center">
        <h2>This app needs permission to use your location & camera to work.</h2>
      </div>
    </div>


    <!--
      The main UI controls that facilitate showing & closing settings & map & fullscreen
    -->
    <div id="close-all" class="hamburger animate hide">
      <img src="img/x.svg" alt="Close">
    </div>
    <div id="open-settings" class="hamburger">
      <img src="img/settings.svg" alt="Settings">
    </div>
    <div id="open-map" class="hamburger">
      <img src="img/map-pin.svg" alt="Map">
    </div>
    <div id="open-fullscreen" class="fullscreen">
      <div class="bar top-left-1"></div>
      <div class="bar top-left-2"></div>
      <div class="bar top-right-1"></div>
      <div class="bar top-right-2"></div>
      <div class="bar bottom-left-1"></div>
      <div class="bar bottom-left-2"></div>
      <div class="bar bottom-right-1"></div>
      <div class="bar bottom-right-2"></div>
    </div>

    <!-- This section contains all wizards & notices, starting with device motion API not enabled -->
    <section id="device_motion_problem" class="wizard hide">
      <div class="wizard-wrapper">
        <div class="slide slide-nr0">
          <div class="padded-wrap">
            <h2>Device orientation disabled!</h2>
            <p>This app needs device orientation to work properly. If you're using Safari it is disabled by default. Please enable it by going to:<br><br>
              <strong>Settings</strong> → <strong>Safari</strong> and <strong><em>Enable</em> Motion & Orientation Access</strong></p>
            <a class="btn btn-next error" href="./">Reload</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Wizard for magnetometer calibration -->
    <section id="needs_calibration" class="wizard hide">
      <div class="wizard-wrapper">
        <div class="slide slide-nr0">
          <div class="padded-wrap">
            <h2>Compass needs calibration!</h2>
            Please recalibrate compass by moving your phone in figure 8 pattern 5 times and then press Done.
          </div>
          <a class="btn btn-next finish" href="#finish">Done</a>
        </div>
      </div>
    </section>

    <!-- Permission error notice shown when someone declines camera or location access -->
    <section id="permission_error" class="wizard hide">
      <div class="wizard-wrapper">
        <div class="slide slide-nr0">
          <div class="padded-wrap">
            <h2>Permsission error!</h2>
            <p>There was an error while getting all the neccessary permissions. Please reload the page and try again!</p>
            <a class="btn btn-next error" href="./">Reload</a>
          </div>
        </div>
      </div>
    </section>

    <!-- No media motice shown when no camera is detected -->
    <section id="no_media" class="wizard hide">
      <div class="wizard-wrapper">
        <div class="slide slide-nr0">
          <div class="padded-wrap">
            <h2>No media device found!</h2>
            <p>We couldn't gain access to your camera. Is something blocking the camera from being used?</p>
            <a class="btn btn-next error" href="./">Reload</a>
          </div>
        </div>
      </div>
    </section>

    <!-- First time user wizard -->
    <section id="wizard" class="wizard hide">
      <div class="wizard-wrapper">
        <div class="slide slide-nr0">
          <div class="padded-wrap">
            <h2>Welcome!</h2>
            <p>
              Places AR is an experimental web app that aims to provide users with means to locate places
              using Augmented Reality.
            </p>
            <p>
              First we need to get some permissions to show you video feed and get your position.
            </p>
          </div>
          <a class="btn btn-next" href="#next">Let's get started!</a>
        </div>
        <div class="slide slide-nr1 hide" data-action="camera">
          <div class="padded-wrap">
            <h2>Video</h2>
            <p>
              First we need access to your camera. Without a camera feed, this cannot be a AR app.
              <img class="wizard-icon-big" src="img/camera.svg" alt="camera">
            </p>
          </div>
          <a class="btn btn-next" href="#next">Next</a>
        </div>
        <div class="slide slide-nr2 hide" data-action="location">
          <div class="padded-wrap">
            <h2>Location</h2>
            <p>
              We also need your permission to pinpoint your location. Otherwise we cannot tell where you are and
              that makes our job impossible.
              <img class="wizard-icon-big" src="img/map-pin.svg" alt="Map">
            </p>
          </div>
          <a class="btn btn-next" href="#next">Next</a>
        </div>
        <div class="slide slide-nr3 hide">
          <div class="padded-wrap">
            <h2>Great!</h2>
            <p>
              We have all permissions we needed. Now you can start using the app.
            </p>
            <p>Keep in mind it works best outside.</p>
          </div>
          <a class="btn btn-next finish" href="#finish">Finish</a>
        </div>
      </div>
    </section>

    <!-- Wizard for north approximation -->
    <section id="wizard_relative" class="wizard hide">
      <div class="wizard-wrapper">
        <div class="slide slide-nr0">
          <div class="padded-wrap">
            <h2>We might have a slight problem...</h2>
            <p>
              We have detected your browser cannot tell where the North is. But we can help!
            </p>
            <p>
              We can use your location to approximate where north is. All you have to do is follow the instructions displayed on the screen.
            </p>
          </div>
          <a class="btn btn-next" href="#next">Let's get started!</a>
        </div>
        <div class="slide slide-nr1 hide" data-action="calibration">
          <div class="padded-wrap">
            <h2>Calibration</h2>
            <p>
              Please walk with your phone directly in front of you. The direction of your walk shouldn't be important.
            </p>
            <p>
              Then click on the "Start calibration" button.
            </p>
          </div>
          <a class="btn btn-next" href="#next">Start calibration</a>
        </div>
        <div class="slide slide-nr2 hide">
          <div class="padded-wrap">
            <h2>Calibration progress</h2>
            <p>
              Keep walking until you are satisfied with the error margin, then click finish.<br>
              Current deviation is <strong id="deviation">Waiting</strong>, based on <strong id="event_count">Waiting</strong> location updates.<br>
              A<strong id="data1">Waiting</strong>, H<strong id="data2">Waiting</strong>, B<strong id="data3">Waiting</strong><br>
              The app will vibrate when it thinks that it is good enough.
            </p>
          </div>
          <a class="btn btn-next finish" href="#finish">Finish</a>
        </div>
      </div>
    </section>
    <!-- End of wizard section-->

    <!-- Settings modal window -->
    <section id="settings" class="hide fs-modal">
      <section class="padded-wrap">
        <div id="save" class="hamburger animate">
          <img src="img/check.svg" alt="Save">
        </div>
        <h2>Settings</h2>
        <div class="settings-wrap">
          <h3>Video quality</h3>
          <div class="slider">
            (low) 0.1 <input type="range" name="videoQuality" step="0.1" max="1" min="0.1" value="1"> 1 (high)
            <div class="visible-value">
              <input type="number" name="videoQuality-nr" min="0.1" max="1" value="1" step="0.1">
            </div>
            <div class="warning">
              You might be asked for camera permission again
            </div>
          </div>
          <h3>Max location age</h3>
          <div class="slider">
            1s <input type="range" name="geoMaxAge" step="1" max="10" min="1" value="1"> 10s
            <div class="visible-value">
              <input type="number" name="geoMaxAge-nr" min="1" max="10" value="1" step="1">
            </div>
          </div>
        </div>
      </section>
    </section>

    <!-- Place select modal window-->
    <section id="place-select" class="hide fs-modal">
      <div id="infowindow-content">
        <div class="pac-card" id="pac-card">
          <div id="pac-container">
            <input id="pac-input" type="text" placeholder="Enter a location">
          </div>
        </div>
        <img id="place-icon" src="" height="24" width="24">
        <span id="place-name" class="title"></span><br>
        <span id="place-address"></span>
        <div class="btn btn-success">Show me!</div>
      </div>
      <section class="full-wrap">
        <h2>Select a point of interest</h2>
        <section id="map"></section>
        <div id="recenter" class="noselect"><img src="img/crosshair.svg" alt="crosshair"> Recenter</div>
      </section>
    </section>
  </main>
  <!-- END OF APP; SCRIPT LOADING-->
  <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCIJ0abeCpJQ909O8lEWj6lfpRngYtgFOM&libraries=places"></script>
  <script src="js/places-ar.min.js?ver=<?php echo PLACES_AR_VER; ?>"></script>
  <link href="https://fonts.googleapis.com/css?family=Roboto+Mono|Roboto:400,700&amp;subset=latin-ext" rel="stylesheet">
</body>

</html>