<?php
define('PLACES_AR_VER', '0.9');
?>
<!doctype html>
<html class="no-js" lang="">
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <title>Places AR Demo</title>
  <meta name="description" content="">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

  <link rel="manifest" href="site.webmanifest">
  <link rel="apple-touch-icon" href="icon.png">
  <!-- Place favicon.ico in the root directory -->

  <link rel="stylesheet" href="css/normalize.css">
  <link rel="stylesheet" href="css/main.css">
</head>

<body>
  <!--[if IE]>
    <p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="https://browsehappy.com/">upgrade your browser</a> to improve your experience and security.</p>
  <![endif]-->

  <noscript>
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

  <!-- Add your site or application content here -->
  <main id="main">
    <div id="compass">
        <div class="compass-slider">
            <div class="compass-segment">
                <div class="compass-mark">N</div>
            </div>
            <div id="compass-icon" class="compass-icon" style="left: 45%;display: none;"></div>
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
    <div id="close-all" class="hamburger animate hide">
      <div class="bar bar1"></div>
      <div class="bar bar2"></div>
      <div class="bar bar3"></div>
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
    <section id="wizard-relative" class="wizard hide">
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
        <div class="slide slide-nr1 hide">
          <div class="padded-wrap">
            <h2>Preparation</h2>
            <p>
              Please find a place where you can walk about 100 meters straight. Once you are ready, hold the phone directly in front of you.
            </p>
            <p>
              Then click on the "Start calibration" button.
            </p>
          </div>
          <a class="btn btn-next" href="#next">Start calibration</a>
        </div>
        <div class="slide slide-nr2 hide" data-action="calibration1">
          <div class="padded-wrap">
            <h2>Calibration part 1</h2>
            <p>
              Please walk forward now. Once we have a fix, you will be notified.
            </p>
          </div>
        </div>
        <div class="slide slide-nr3 hide">
          <div class="padded-wrap">
            <h2>Calibration step 1 done</h2>
            <p>
              First step of the calibration is complete. Now please turn back.
            </p>
            <p>
              Then click on the "Continue calibration" button.
            </p>
          </div>
          <a class="btn btn-next" href="#next">Continue calibration</a>
        </div>
        <div class="slide slide-nr4 hide" data-action="calibration2">
          <div class="padded-wrap">
            <h2>Calibration step 2</h2>
            <p>
              Now please walk back to where you started.
            </p>
          </div>
        </div>
        <div class="slide slide-nr5 hide">
          <div class="padded-wrap">
            <h2>Calibration complete</h2>
            <p>
              Calibration is now complete and we should have a pretty good approximation of the North. 
            </p>
            <p>
              Click finish to proceed to the app.
            </p>
          </div>
          <a class="btn btn-next finish" href="#finish">Finish</a>
        </div>
      </div>
    </section>
    <section id="place-info">No place selected yet</section>
    <section id="settings" class="hide fs-modal">
      <section>
        <h2>Settings</h2>
        <h3>Video resolution</h3>
        <select>
          <option>1920x1080</option>
          <option>1280x720</option>
        </select>
        <!-- Available resolution goes here... -->
        <h3>Location update frequency</h3>
        <!-- SLIDER GOES HERE... -->
        <input type="range" name="location-freq">
      </section>
    </section>

    <section id="place-select" class="hide fs-modal">
      <div id="infowindow-content">
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
    <div class="video-container">
      <video id="video" width="100%" height="100%" autoplay class="hide"></video>
    </div>
    <div id="insufficient-permissions">
      <div class="vertically-center">
        <h2>This app needs permission to use your location & camera to work.</h2>
      </div>
    </div>
  </main>
  <div id="rotate_screen">
    <div class="rotate-wrapper">
      <h2>Please rotate your screen to landscape mode</h2>
      <img src="img/rotate.svg" alt="rotate">
    </div>
  </div>
  <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCIJ0abeCpJQ909O8lEWj6lfpRngYtgFOM&libraries=places"></script>
  <script src="js/places-ar.min.js?ver=<?php echo PLACES_AR_VER;?>"></script>
  <link href="https://fonts.googleapis.com/css?family=Roboto+Mono|Roboto:400,700&amp;subset=latin-ext" rel="stylesheet">
</body>

</html>
