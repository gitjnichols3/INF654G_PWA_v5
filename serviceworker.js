const CACHE_NAME = "gig-tracker_v5";

const ASSETS_TO_CACHE = [
    "/",
    "/manifest.json",
    "/serviceworker.js",
    "/index.html",
    "/pages/ASU.html",
    "/pages/auth.html",
    "/pages/choir.html",
    "/pages/contact.html",
    "/pages/cooper.html",
    "/pages/flag.html",
    "/pages/laveenff.html",
    "/pages/p1.html",
    "/pages/phouseshow.html",
    "/pages/rebel.html",
    "/pages/tombstone.html",
    "/pages/zoe.html",
    "/css/materialize.min.css",
    "/css/styles.css",
    "/js/auth.js",
    "/js/email.js",
    "/js/firebaseConfig.js",
    "/js/firebaseDB.js",
    "/js/materialize.min.js",
    "/js/profile.js",
    "/js/signIn.js",
    "/js/ui.js",
    "/images/BHouseShow/IMG_5510.JPEG",
    "/images/BHouseShow/Z C and Elle.PNG",
    "/images/BHouseShow/Zoe and Sam.PNG",
    "/images/CChoirConcert/Brazil.PNG",
    "/images/CChoirConcert/Concert and middle.PNG",
    "/images/CChoirConcert/IMG_5486.JPG",
    "/images/CChoirConcert/IMG_5487.JPG",
    "/images/CChoirConcert/IMG_5490.JPG",
    "/images/CChoirConcert/Snowballs.PNG",
    "/images/CFlagShow/IMG_5159.jpg",
    "/images/CFlagShow/IMG_5160.jpg",
    "/images/CFlagShow/IMG_5161.jpg",
    "/images/CFlagShow/IMG_5162.jpg",
    "/images/CFlagShow/IMG_5163.jpg",
    "/images/CFlagShow/IMG_5164.jpg",
    "/images/CFlagShow/IMG_5166.jpg",
    "/images/CSecretHarbor-Tombstone/IMG_5420.JPG",
    "/images/CSecretHarbor-Tombstone/IMG_5426.jpg",
    "/images/CSecretHarbor-Tombstone/IMG_5429.JPG",
    "/images/CSecretHarbor-Tombstone/IMG_5432.JPG",
    "/images/CSecretHarbor-Tombstone/IMG_5434.JPG",
    "/images/CSecretHarbor-Tombstone/IMG_5436.JPG",
    "/images/CSecretHarbor-Tombstone/IMG_5440.JPG",
    "/images/CSecretHarbor-Tombstone/IMG_5441.JPG",
    "/images/CSecretHarbor-Tombstone/IMG_5442.JPG",
    "/images/CSecretHarbor-Tombstone/IMG_5445.JPG",
    "/images/CSecretHarbor-Tombstone/IMG_5454.JPG",
    "/images/CSecretHarbor-Tombstone/IMG_5458.JPG",
    "/images/CSecretHarbor-Tombstone/IMG_5459.JPG",
    "/images/CSecretHarbor-Tombstone/IMG_5461.JPG",
    "/images/CSecretHarbor-Tombstone/IMG_5465.JPG",
    "/images/ZASUShowcase/Z1.PNG",
    "/images/ZASUShowcase/Z2.PNG",
    "/images/ZASUShowcase/Z3.PNG",
    "/images/ZASUShowcase/Z4.PNG",
    "/images/ZLaveenFolkFestival/IMG_3438.JPG",
    "/images/ZLaveenFolkFestival/IMG_3442.JPG",
    "/images/ZLaveenFolkFestival/IMG_3443.JPG",
    "/images/ZLaveenFolkFestival/IMG_3444.JPG",
    "/images/ZLaveenFolkFestival/IMG_3445.JPG",
    "/images/ZLaveenFolkFestival/IMG_3480.JPG",
    "/images/ZLaveenFolkFestival/IMG_5392.JPG",
    "/images/ZLaveenFolkFestival/PR1.PNG",
    "/images/ZLaveenFolkFestival/PR2.PNG",
    "/images/ZRebelLounge/IMG_5335.jpg",
    "/images/ZRebelLounge/IMG_5337.jpg",
    "/images/ZRebelLounge/IMG_5338.jpg",
    "/images/ZRebelLounge/IMG_5339.jpg",
    "/images/ZRebelLounge/IMG_5341.jpg",
    "/images/ZRebelLounge/IMG_5342.jpg",
    "/images/ZRebelLounge/IMG_5343.jpg",
    "/images/ZRebelLounge/IMG_5344.jpg",
    "/images/ZRebelLounge/IMG_5345.jpg",
    "/images/ZRebelLounge/Zoe and Sam 1.PNG",
    "/images/ZRebelLounge/Zoe and Sam 2.PNG",
    "/images/ZRebelLounge/Zoe and Sam 3.PNG",
    "/images/p1/IMG_2523.JPEG",
    "/images/p1/IMG_4359.JPEG",
    "/images/p1/IMG_4360.JPEG",
    "/images/p1/IMG_4363.JPEG",
    "/images/p1/IMG_4367.JPEG",
    "/images/p1/IMG_4376.JPEG",
    "/images/16.png",
    "/images/32.png",
    "/images/c-mug-s.png",
    "/images/c-p1Thumb.png",
    "/images/ig icon.png",
    "/images/IMG_3039.JPEG",
    "/images/YT icon.png",
    "/images/z-mug-s.png",
    "/images/z-p1Thumb.png",
    "/images/icons/512.png",
    "/images/icons/192.png",
    "/images/icons/32.png",
    "/images/icons/16.png",
    "/images/screenshots/screenshot1.png",
    "/images/screenshots/screenshot2.png",
    "/images/screenshots/screenshot3.png",
    "/images/screenshots/screenshot4.png"
];

//Install event
self.addEventListener("install", (event) => {
    console.log("Service worker: Installing...");
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        console.log("Service worker: caching files");
        return cache.addAll(ASSETS_TO_CACHE);
      })
    );
  });
  
  //Activate event
  self.addEventListener("activate", (event) => {
    console.log("Service Worker: Activating...");
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log("Service Worker: Deleting old Cache");
              return caches.delete(cache);
            }
          })
        );
      })
    );
  });
  
  // Fetch event with async/wait
  self.addEventListener("fetch", (event) => {
    event.respondWith(
      (async function () {
        if (event.request.method !== "GET") {
          return fetch(event.request);
        }

        const cachedResponse = await caches.match(event.request);
  
        if (cachedResponse) {
          return cachedResponse;
        }
  
        try {
          const networkResponse = await fetch(event.request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone()); // Update cache with the fetched response
          return networkResponse;
        } catch (error) {
          console.error("Fetch failed, returning offline page:", error);
          // Optionally, return an offline page here if available in the cache
        }
      })()
    );
  });
