/* ============================================================
   MAGIC MOUSE CURSOR - Decorative ring + dot that follows the
   real system cursor (arrow / hand-pointer stays fully visible).
   Small ring+dot normally; a big filled circle on hover, matching
   the reference demo. Only active above 991px, real-mouse devices.
   ============================================================ */

(function() {
  var outer = document.querySelector('.mmc-outer');
  var inner = document.querySelector('.mmc-inner');
  if (!outer || !inner) return;

  var active = false;

  function isDesktop() {
    return window.innerWidth > 991 &&
      (!window.matchMedia || window.matchMedia('(pointer: fine)').matches);
  }

  function enableCursor() {
    outer.style.visibility = 'visible';
    inner.style.visibility = 'visible';
    active = true;
  }

  function disableCursor() {
    outer.style.visibility = 'hidden';
    inner.style.visibility = 'hidden';
    outer.classList.remove('mmc-hover');
    inner.classList.remove('mmc-hover');
    active = false;
  }

  function refresh() {
    var shouldBeActive = isDesktop();
    if (shouldBeActive && !active) enableCursor();
    if (!shouldBeActive && active) disableCursor();
  }

  refresh();
  window.addEventListener('resize', refresh);

  // Move both layers to the pointer position
  window.addEventListener('mousemove', function(e) {
    if (!active) return;
    var pos = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';
    outer.style.transform = pos;
    inner.style.transform = pos;
  });

  // Grow into a big filled circle while hovering clickable elements
  var hoverSelector = 'a, .cursor-pointer, button, input, textarea, select, .filter, ' +
    '.nav-btn, .read-article, .cv-btn, .primary-btn, .modal-close, .theme-switch, ' +
    '.whatsapp-card, [role="button"], label';

  document.body.addEventListener('mouseover', function(e) {
    if (active && e.target.closest(hoverSelector)) {
      outer.classList.add('mmc-hover');
      inner.classList.add('mmc-hover');
    }
  });

  document.body.addEventListener('mouseout', function(e) {
    if (e.target.closest(hoverSelector)) {
      outer.classList.remove('mmc-hover');
      inner.classList.remove('mmc-hover');
    }
  });
})();


/* ============================================================
   CONTENT PROTECTION - Disable right-click, copy, cut & drag
   ============================================================ */

document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});

document.addEventListener('copy', function(e) {
  e.preventDefault();
});

document.addEventListener('cut', function(e) {
  e.preventDefault();
});

document.addEventListener('dragstart', function(e) {
  if (e.target.tagName === 'IMG') e.preventDefault();
});

document.addEventListener('keydown', function(e) {
  var key = (e.key || '').toLowerCase();
  var blockedCombo = (e.ctrlKey || e.metaKey) && (key === 'c' || key === 'u' || key === 's');
  if (blockedCombo || key === 'f12') {
    e.preventDefault();
  }
});


/* ============================================================
   NAVIGATION - Tab Switching
   ============================================================ */

const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section-panel');

/**
 * Sets the active section and updates navigation buttons
 * @param {string} section - The section ID to activate
 */
function setActiveSection(section) {
  // Update nav buttons
  navButtons.forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.section === section);
  });

  // Update sections
  sections.forEach(function(s) {
    s.classList.toggle('active', s.id === section);
  });

  // Store active section on body for responsive sidebar visibility
  document.body.dataset.activeSection = section;
}

// Add click event to each navigation button
navButtons.forEach(function(btn) {
  btn.addEventListener('click', function() {
    setActiveSection(btn.dataset.section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// Set initial active section
var initialActive = document.querySelector('.nav-btn.active')?.dataset.section || 'home';
setActiveSection(initialActive);


/* ============================================================
   THEME TOGGLE - Dark / Light Mode
   ============================================================ */

(function() {
  var root = document.documentElement;
  var btn = document.getElementById('themeSwitch');

  if (!btn) return;

  /**
   * Updates the button's ARIA state based on current theme
   */
  function applyState() {
    var isLight = root.getAttribute('data-theme') === 'light';
    btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
  }

  // Apply initial state
  applyState();

  // Toggle theme on button click
  btn.addEventListener('click', function() {
    var isLight = root.getAttribute('data-theme') === 'light';

    if (isLight) {
      root.removeAttribute('data-theme');
      try {
        localStorage.setItem('theme', 'dark');
      } catch (e) {
        /* ignore */
      }
    } else {
      root.setAttribute('data-theme', 'light');
      try {
        localStorage.setItem('theme', 'light');
      } catch (e) {
        /* ignore */
      }
    }

    applyState();
  });
})();


/* ============================================================
   FILTERS - Projects & Blog
   ============================================================ */

/**
 * Sets up filter functionality for a container
 * @param {string} containerId - ID of the container element
 * @param {string} itemSelector - CSS selector for filterable items
 */
function setupFilter(containerId, itemSelector) {
  var box = document.getElementById(containerId);
  if (!box) return;

  box.querySelectorAll('.filter').forEach(function(button) {
    button.addEventListener('click', function() {
      // Update active filter button
      box.querySelectorAll('.filter').forEach(function(b) {
        b.classList.remove('active');
      });
      button.classList.add('active');

      // Get filter value
      var filter = button.dataset.filter;

      // Show/hide items based on filter
      document.querySelectorAll(itemSelector).forEach(function(item) {
        var categories = item.dataset.category.split(' ');
        item.style.display = (filter === 'all' || categories.includes(filter)) ? '' : 'none';
      });
    });
  });
}

// Initialize filters for projects and blog
setupFilter('projectFilters', '.project-card');
setupFilter('blogFilters', '.blog-card');


/* ============================================================
   PROJECT MODAL
   ============================================================ */

var modal = document.getElementById('projectModal');
var modalTitle = document.getElementById('modalTitle');
var modalText = document.getElementById('modalText');
var modalLink = document.getElementById('modalLink');
var modalImageWrap = document.getElementById('modalImageWrap');

// Open modal when "View Project" is clicked
// Delegated on the grid container so it also works for cards added dynamically
// (e.g. after loading live data from the admin panel).
var projectGridEl = document.getElementById('projectGrid');
if (projectGridEl) {
  projectGridEl.addEventListener('click', function(e) {
    var button = e.target.closest('.view-project');
    if (!button) return;

    var card = button.closest('.project-card');
    if (!card) return;

    // Set modal content from card data
    modalTitle.textContent = card.dataset.title;
    modalText.textContent =
      card.querySelector('p').textContent +
      ' View the live project, explore the design, and see how I built it.';
    modalLink.href = card.dataset.url;

    // Handle modal image
    modalImageWrap.innerHTML = '';
    var imgSrc = card.dataset.image;

    if (imgSrc) {
      // Use real image if provided
      var img = document.createElement('img');
      img.src = imgSrc;
      img.alt = card.dataset.title || 'Project preview';
      img.loading = 'lazy';
      modalImageWrap.appendChild(img);
    } else {
      // Fallback: clone the gradient thumbnail
      var thumb = card.querySelector('.project-image');
      if (thumb) {
        modalImageWrap.appendChild(thumb.cloneNode(true));
      }
    }

    // Show modal
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
  });
}

// Close modal via close buttons
document.querySelectorAll('#projectModal .modal-close').forEach(function(btn) {
  btn.onclick = function() {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  };
});

// Close modal by clicking overlay
modal.addEventListener('click', function(e) {
  if (e.target === modal) {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  }
});


/* ============================================================
   CV PREVIEW MODAL
   ============================================================ */

(function() {
  var cvBtn = document.getElementById('cvBtn');
  var cvModal = document.getElementById('cvModal');
  if (!cvBtn || !cvModal) return;

  function openCvModal() {
    cvModal.classList.add('show');
    cvModal.setAttribute('aria-hidden', 'false');
  }

  function closeCvModal() {
    cvModal.classList.remove('show');
    cvModal.setAttribute('aria-hidden', 'true');
  }

  // Clicking "Download CV" in the sidebar opens the preview popup first
  cvBtn.addEventListener('click', function(e) {
    e.preventDefault();
    openCvModal();
  });

  // Close popup via the "x" icon (returns to the page underneath)
  cvModal.querySelectorAll('.modal-close').forEach(function(btn) {
    btn.addEventListener('click', closeCvModal);
  });

  // Close popup by clicking the overlay
  cvModal.addEventListener('click', function(e) {
    if (e.target === cvModal) closeCvModal();
  });
})();


/* ============================================================
   BOOK A CALL MODAL - Plain iframe to the Cal.com booking page.
   No third-party embed script involved, so it can't double-fire
   or leave the page scroll-locked; the iframe is only pointed at
   Cal.com the moment the modal actually opens (lazy-loaded).
   ============================================================ */

(function() {
  var triggers = document.querySelectorAll('.js-book-call');
  var bookModal = document.getElementById('bookCallModal');
  if (!triggers.length || !bookModal) return;

  var iframe = bookModal.querySelector('iframe');

  function openBookModal() {
    // Only point the iframe at Cal.com the first time it's opened
    if (iframe.getAttribute('src') === 'about:blank') {
      iframe.src = iframe.dataset.src;
    }
    bookModal.classList.add('show');
    bookModal.setAttribute('aria-hidden', 'false');
  }

  function closeBookModal() {
    bookModal.classList.remove('show');
    bookModal.setAttribute('aria-hidden', 'true');
  }

  triggers.forEach(function(trigger) {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      openBookModal();
    });
  });

  bookModal.querySelectorAll('.modal-close').forEach(function(btn) {
    btn.addEventListener('click', closeBookModal);
  });

  bookModal.addEventListener('click', function(e) {
    if (e.target === bookModal) closeBookModal();
  });
})();


/* ============================================================
   CUSTOM YOUTUBE PLAYER - Facade thumbnail + play button only.
   No YouTube branding/logo/title/seek-bar shows before playing;
   once playing, only our own Play/Pause + Mute buttons are
   visible (native YouTube controls are turned off entirely).
   The real YouTube IFrame API only loads on the first play click.
   ============================================================ */

(function() {
  var ytVideos = document.querySelectorAll('.yt-video');
  if (!ytVideos.length) return;

  var apiReady = false;
  var pendingInits = [];

  window.onYouTubeIframeAPIReady = function() {
    apiReady = true;
    pendingInits.forEach(function(fn) { fn(); });
    pendingInits = [];
  };

  function loadYouTubeAPI() {
    if (document.getElementById('youtube-iframe-api')) return;
    var tag = document.createElement('script');
    tag.id = 'youtube-iframe-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }

ytVideos.forEach(function(container) {
  var videoId = container.dataset.ytId;
  var playerDiv = container.querySelector('.yt-player');
  var thumb = container.querySelector('.yt-thumb');
  var playBtn = container.querySelector('.yt-play-btn');
  var muteBtn = container.querySelector('.yt-mute-btn');
  var playIcon = playBtn.querySelector('i');
  var muteIcon = muteBtn.querySelector('i');
  var player = null;
  var started = false;

  // --- নতুন: iframe-এর উপর transparent blocker ---
  var blocker = document.createElement('div');
  blocker.className = 'yt-blocker';
  container.appendChild(blocker);

  function setPlayIcon(name) {
    playIcon.className = 'fa fa-' + name;
  }

  function togglePlay() {
    if (!started) {
      started = true;
      loadYouTubeAPI();
      if (apiReady) {
        createPlayer();
      } else {
        pendingInits.push(createPlayer);
      }
      return;
    }
    if (!player || typeof player.getPlayerState !== 'function') return;
    if (player.getPlayerState() === YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }

  function createPlayer() {
    player = new YT.Player(playerDiv, {
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        disablekb: 1,
        fs: 0,
        playsinline: 1
      },
      events: {
        onReady: function(e) {
          thumb.style.display = 'none';
          muteBtn.hidden = false;
          e.target.playVideo();
        },
        onStateChange: function(e) {
          if (e.data === YT.PlayerState.PLAYING) {
            setPlayIcon('pause');
          } else if (e.data === YT.PlayerState.PAUSED) {
            setPlayIcon('play');
          } else if (e.data === YT.PlayerState.ENDED) {
            setPlayIcon('repeat');
          }
        }
      }
    });
  }

  // playBtn এবং blocker দুটোতেই একই toggle লজিক
  playBtn.addEventListener('click', togglePlay);
  blocker.addEventListener('click', togglePlay);

  muteBtn.addEventListener('click', function() {
    if (!player) return;
    if (player.isMuted()) {
      player.unMute();
      muteIcon.className = 'fa fa-volume-up';
    } else {
      player.mute();
      muteIcon.className = 'fa fa-volume-off';
    }
  });
});


/* ============================================================
   GALLERY LIGHTBOX - Click any uploaded photo to view it large
   ============================================================ */

(function() {
  var grid = document.getElementById('galleryGrid');
  var galleryModal = document.getElementById('galleryModal');
  if (!grid || !galleryModal) return;

  var modalImg = document.getElementById('galleryModalImg');
  var modalCaption = document.getElementById('galleryModalCaption');

  function openGalleryModal(src, caption) {
    modalImg.src = src;
    modalImg.alt = caption;
    modalCaption.textContent = caption;
    galleryModal.classList.add('show');
    galleryModal.setAttribute('aria-hidden', 'false');
  }

  function closeGalleryModal() {
    galleryModal.classList.remove('show');
    galleryModal.setAttribute('aria-hidden', 'true');
  }

  grid.addEventListener('click', function(e) {
    var img = e.target.closest('.gallery-item img');
    if (!img) return; // empty/placeholder slots have no <img>, so nothing to open
    var caption = img.closest('.gallery-item').dataset.caption || '';
    openGalleryModal(img.getAttribute('src'), caption);
  });

  galleryModal.querySelectorAll('.modal-close').forEach(function(btn) {
    btn.addEventListener('click', closeGalleryModal);
  });

  galleryModal.addEventListener('click', function(e) {
    if (e.target === galleryModal) closeGalleryModal();
  });
})();


/* ============================================================
   REVIEWS CAROUSEL - Autoplay with Dots
   ============================================================ */

var reviews = [].slice.call(document.querySelectorAll('.review-card'));
var track = document.getElementById('reviewTrack');
var dots = document.getElementById('reviewDots');

var reviewIndex = 0;
var reviewTimer;

// Create dot indicators
reviews.forEach(function(_, i) {
  var dot = document.createElement('span');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.onclick = function() { goReview(i); };
  dots.appendChild(dot);
});

/**
 * Navigate to a specific review slide
 * @param {number} i - Index of the review to show
 */
function goReview(i) {
  reviewIndex = (i + reviews.length) % reviews.length;
  track.style.transform = 'translateX(-' + (reviewIndex * 100) + '%)';

  dots.querySelectorAll('.dot').forEach(function(d, n) {
    d.classList.toggle('active', n === reviewIndex);
  });

  restartReviewTimer();
}

/**
 * Restart the autoplay timer
 */
function restartReviewTimer() {
  clearInterval(reviewTimer);
  reviewTimer = setInterval(function() {
    goReview(reviewIndex + 1);
  }, 5000);
}

// Pause autoplay on hover
var reviewSlider = document.querySelector('.review-slider');
reviewSlider.addEventListener('mouseenter', function() {
  clearInterval(reviewTimer);
});
reviewSlider.addEventListener('mouseleave', restartReviewTimer);

// Start autoplay
restartReviewTimer();


/* ============================================================
   PHONE / WHATSAPP - Digits-only Number Fields
   ============================================================ */

/**
 * Restricts a text/tel input to digits only, live, as the user types.
 * @param {string} inputId
 */
function restrictToDigits(inputId) {
  var el = document.getElementById(inputId);
  if (!el) return;
  el.addEventListener('input', function() {
    el.value = el.value.replace(/[^0-9]/g, '');
  });
}

restrictToDigits('phoneNumber');
restrictToDigits('waNumber');


/* ============================================================
   CONTACT FORM - Success Popup
   ============================================================ */

var successModal = document.getElementById('successModal');

/**
 * Opens the success modal
 */
function openSuccessModal() {
  successModal.classList.add('show');
  successModal.setAttribute('aria-hidden', 'false');
}

/**
 * Closes the success modal
 */
function closeSuccessModal() {
  successModal.classList.remove('show');
  successModal.setAttribute('aria-hidden', 'true');
}

/**
 * Google Apps Script "Web App" URL that writes each submission into the
 * Google Sheet: https://docs.google.com/spreadsheets/d/15GIIDcgsl0pvMFdcoMWIftX6AzKrC9MaFG58zvmwAbc/edit
 *
 * NOTE: A Google Sheet link by itself cannot receive data from a website —
 * Google requires a small Apps Script "Web App" in front of it to accept
 * submissions. Deploy the script (see the accompanying setup notes) and
 * paste the deployment URL below to activate saving to the sheet.
 */
var SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzHoD3WHj-SrhPIUZRn6mFGEdMmTSUjluZYv3yFwLOhxDU8IcCcz9GrBawSlTcCj0ND/exec';

// Handle form submission
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();

  var form = e.target;

  var payload = {
    name: document.getElementById('contactName').value,
    email: document.getElementById('contactEmail').value,
    subject: document.getElementById('contactSubject').value,
    phone: document.getElementById('phoneNumber').value,
    whatsapp: document.getElementById('waNumber').value,
    service: document.getElementById('contactService').value,
    message: document.getElementById('contactMessage').value
  };

  // Send the data to the Google Sheet via the Apps Script webhook
  if (SHEET_WEBHOOK_URL && SHEET_WEBHOOK_URL.indexOf('PASTE_YOUR') === -1) {
    fetch(SHEET_WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).catch(function() {
      /* Network issue: the user still sees the success popup below,
         since Google's response can't be read in no-cors mode anyway. */
    });
  }

  form.reset();
  openSuccessModal();
});

// Close success modal via close buttons
document.querySelectorAll('#successModal .modal-close').forEach(function(btn) {
  btn.onclick = closeSuccessModal;
});

document.getElementById('successCloseBtn').addEventListener('click', closeSuccessModal);

// Close success modal by clicking overlay
successModal.addEventListener('click', function(e) {
  if (e.target === successModal) {
    closeSuccessModal();
  }
});

// Service CTA links: switch to Contact tab without reload
// Delegated on <body> so it also works for links added dynamically later
// (e.g. the About section "Hire Me" button after live data replaces it).
document.body.addEventListener('click', function(e) {
  var link = e.target.closest('[data-contact="true"]');
  if (!link) return;
  e.preventDefault();
  var btn = document.querySelector('.nav-btn[data-section="contact"]');
  if (btn) btn.click();
});


/* ============================================================
   BLOG - Inline Article View (No Page Reload)
   ============================================================ */

/**
 * Blog post data store
 * Each post contains: category, date, title, cover image variant, intro, and sections
 */
var blogPosts = {
  'ai-tools': {
    cat: 'AI & Design',
    date: 'Apr 1, 2026',
    title: 'AI Design Tools: Midjourney, DALL-E & Adobe Firefly',
    cover: 'a',
    img: 'images/blog/ai-design-tools.jpg',
    intro: 'AI design tools are changing the way creative professionals explore ideas, build concepts and move from rough direction to polished visual output.',
    sections: [
      [
        'Why AI tools matter',
        'The best use of AI is not replacing creative thinking. It is accelerating exploration. Designers can test compositions, art directions, visual moods and concepts in minutes, then refine the strongest direction with traditional design tools.'
      ],
      [
        'A practical workflow',
        'Start with a clear brief, generate several visual directions, shortlist the strongest concepts, refine the selected direction and finally prepare production-ready assets. Keeping the human review step is essential for consistency and brand quality.'
      ],
      [
        'Choosing the right tool',
        'Use image-generation tools when you need concept exploration, editing tools when you need precise control, and collaborative design tools when the final interface needs structured layouts and reusable components.'
      ]
    ]
  },

  'uiux-basics': {
    cat: 'Web Design',
    date: 'Apr 19, 2026',
    title: 'UI/UX Design Basics: App & Website Fundamentals',
    cover: 'b',
    img: 'images/blog/uiux-design-basics.jpg',
    intro: 'A strong interface starts with clarity. Good UI/UX helps users understand what they can do, where they are and what should happen next.',
    sections: [
      [
        'Start with user goals',
        'Before choosing colors or components, understand the user task. A clear hierarchy should make the primary action obvious and reduce unnecessary decisions.'
      ],
      [
        'Structure before decoration',
        'Wireframes, content hierarchy and spacing should be solved before visual polish. This makes the final design more consistent and easier to develop responsively.'
      ],
      [
        'Design for every screen',
        'Responsive design is not just shrinking desktop content. Layouts, type scale, spacing and interactions should adapt intentionally across desktop, tablet and mobile.'
      ]
    ]
  },

  'ai-web-design': {
    cat: 'AI & Design',
    date: 'Apr 3, 2026',
    title: 'How AI Is Changing Modern Web Design',
    cover: 'c',
    img: 'images/blog/ai-web-design.jpg',
    intro: 'AI is becoming part of the modern design workflow, from research and copy exploration to visual concepts and development assistance.',
    sections: [
      [
        'Faster exploration',
        'AI can help generate multiple directions quickly. This is useful during discovery when a team needs to compare ideas before committing to one visual language.'
      ],
      [
        'Human taste still matters',
        'Generated output can be inconsistent. Designers and developers still need to judge usability, accessibility, brand fit, performance and technical feasibility.'
      ],
      [
        'A better workflow',
        'Treat AI as a creative assistant. Give it constraints, review the output critically and use it to remove repetitive work rather than removing the design thinking itself.'
      ]
    ]
  },

  'responsive-wordpress': {
    cat: 'Tutorials',
    date: 'Mar 22, 2026',
    title: 'How to Build a Responsive WordPress Website',
    cover: 'd',
    img: 'images/blog/responsive-wordpress.jpg',
    intro: 'Responsive WordPress development requires more than making a page look good on desktop. Every section needs a deliberate mobile and tablet behavior.',
    sections: [
      [
        'Build a flexible structure',
        'Use a consistent container width, sensible spacing and flexible columns. Avoid fixed dimensions that can cause overflow on smaller screens.'
      ],
      [
        'Check real breakpoints',
        'Test navigation, typography, images, forms and cards at several viewport sizes. A layout that works at one mobile width may still break at another.'
      ],
      [
        'Optimize the final experience',
        'Compress images, remove unnecessary scripts and keep interactions lightweight. Performance and usability should be treated as part of the design.'
      ]
    ]
  },

  'developer-portfolio': {
    cat: 'Career Tips',
    date: 'Mar 10, 2026',
    title: 'How to Build a Strong Developer Portfolio',
    cover: 'e',
    img: 'images/blog/developer-portfolio.jpg',
    intro: 'A portfolio should quickly communicate what you do, what you have built and why a client should trust your work.',
    sections: [
      [
        'Show outcomes',
        'Instead of only listing technologies, explain the problem, your role, the solution and the result. A concise case study is more useful than a long list of tools.'
      ],
      [
        'Make projects easy to explore',
        'Use filters, strong thumbnails, short summaries and a clear project link. Visitors should reach the relevant work without searching through a crowded page.'
      ],
      [
        'Keep it current',
        'Remove weak or outdated examples and keep the portfolio focused on the type of work you want next.'
      ]
    ]
  },

  'design-systems': {
    cat: 'Graphic Design',
    date: 'Feb 28, 2026',
    title: 'Design Systems for Consistent Branding',
    cover: 'f',
    img: 'images/blog/design-systems.jpg',
    intro: 'A small design system can make a website feel more professional by keeping colors, typography, components and spacing consistent.',
    sections: [
      [
        'Define the foundations',
        'Choose your core colors, type scale, spacing rhythm, border radius and common shadows. These foundations become the visual rules for the interface.'
      ],
      [
        'Create reusable components',
        'Buttons, cards, form fields, navigation and badges should follow repeatable patterns. This reduces visual drift as the website grows.'
      ],
      [
        'Document simple rules',
        'A useful system does not need to be huge. Clear examples and a few practical rules are enough to help designers and developers stay aligned.'
      ]
    ]
  }
};

// DOM references for blog views
var blogListView = document.getElementById('blogListView');
var blogArticleView = document.getElementById('blogArticleView');
var blogBackBtn = document.getElementById('blogBackBtn');
var blogSection = document.getElementById('blog');

/**
 * Opens a blog post and renders it inline
 * @param {string} key - The blog post identifier key
 */
function openBlogPost(key) {
  var post = blogPosts[key] || blogPosts['ai-tools'];

  // Populate article content
  document.getElementById('blogCategory').textContent = post.cat.toUpperCase();
  document.getElementById('blogTitle').textContent = post.title;
  document.getElementById('blogMeta').textContent = post.date + '  ·  Abdullah Al Niem';
  document.getElementById('blogCover').className = 'article-cover cover-' + post.cover;
  document.getElementById('blogCover').innerHTML =
    '<img src="' + post.img + '" alt="' + post.title + '" onerror="this.remove()">';

  // Build article body
  var sectionsHTML = post.sections
    .map(function(section) {
      return '<h2>' + section[0] + '</h2><p>' + section[1] + '</p>';
    })
    .join('');

  var ctaHTML =
    '<div class="article-cta">' +
      '<strong>Need a website for your next project?</strong>' +
      '<a href="#" data-contact="true">Let\'s work together →</a>' +
    '</div>';

  document.getElementById('blogBody').innerHTML =
    '<p class="article-intro">' + post.intro + '</p>' +
    sectionsHTML +
    ctaHTML;

  // Switch views: hide list, show article
  blogListView.hidden = true;
  blogArticleView.hidden = false;

  // Scroll to blog section
  if (blogSection) {
    blogSection.scrollIntoView({ block: 'start' });
  }

  // Note: the contact CTA inside the rendered article is handled by the
  // delegated [data-contact="true"] click listener on <body>, so no extra
  // binding is needed here.
}

// Bind "Read Article" links
// Delegated on the list view container so it also works for cards added
// dynamically (e.g. after loading live data from the admin panel).
if (blogListView) {
  blogListView.addEventListener('click', function(e) {
    var link = e.target.closest('.read-article');
    if (!link) return;
    e.preventDefault();
    openBlogPost(link.dataset.post);
  });
}

// Back button: return to blog list view
if (blogBackBtn) {
  blogBackBtn.addEventListener('click', function() {
    blogArticleView.hidden = true;
    blogListView.hidden = false;
  });
}

/* ============================================================
   BACK TO TOP - Scroll-progress ring + eased smooth scroll
   ============================================================ */

(function() {
  var btn = document.getElementById('backToTop');
  if (!btn) return;

  var progressRing = btn.querySelector('.btt-ring-progress');
  var RADIUS = 20;
  var CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  progressRing.style.strokeDasharray = CIRCUMFERENCE;
  progressRing.style.strokeDashoffset = CIRCUMFERENCE;

  function updateButton() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? scrollTop / docHeight : 0;

    progressRing.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
    btn.classList.toggle('show', scrollTop > 300);
  }

  window.addEventListener('scroll', updateButton, { passive: true });
  updateButton();

  // Custom eased scroll-to-top (smoother feel than the default browser jump)
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  btn.addEventListener('click', function() {
    var startY = window.scrollY;
    var startTime = null;
    var duration = 650;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY * (1 - easeInOutCubic(progress)));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  });
})();


/* ============================================================
   LIVE DATA - Load blog posts, projects, about & resume from
   the admin panel (Netlify Function + Blobs). Falls back to the
   content already baked into this page if the fetch fails
   (offline, function not deployed yet, etc.).
   ============================================================ */

(function() {
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderProjects(projects) {
    var grid = document.getElementById('projectGrid');
    if (!grid || !Array.isArray(projects) || !projects.length) return;

    grid.innerHTML = projects.map(function(p) {
      return (
        '<article class="project-card" data-category="' + escapeHtml(p.category) + '" ' +
        'data-title="' + escapeHtml(p.title) + '" data-url="' + escapeHtml(p.url || '#') + '">' +
          '<div class="project-image gradient-a">' +
            '<img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.title) + '" onerror="this.remove()">' +
          '</div>' +
          '<div class="project-body">' +
            '<small>' + escapeHtml(p.tag) + '</small>' +
            '<h3>' + escapeHtml(p.title) + '</h3>' +
            '<p>' + escapeHtml(p.desc) + '</p>' +
            '<button class="view-project"> View More →</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    // Re-apply whatever filter is currently active (default: "all")
    var activeBtn = document.querySelector('#projectFilters .filter.active');
    var filter = activeBtn ? activeBtn.dataset.filter : 'all';
    grid.querySelectorAll('.project-card').forEach(function(item) {
      var categories = (item.dataset.category || '').split(' ');
      item.style.display = (filter === 'all' || categories.includes(filter)) ? '' : 'none';
    });
  }

  function renderBlogCards(blogPostsData) {
    var grid = document.querySelector('#blogListView .blog-grid');
    if (!grid || !blogPostsData) return;

    var keys = Object.keys(blogPostsData);
    if (!keys.length) return;

    grid.innerHTML = keys.map(function(key) {
      var post = blogPostsData[key];
      var filterCat = post.filterCat || 'all';
      var coverClass = post.coverClass || ('b' + ((keys.indexOf(key) % 6) + 1));
      var excerpt = post.excerpt || post.intro || '';

      return (
        '<article class="blog-card" data-category="' + escapeHtml(filterCat) + '">' +
          '<div class="blog-image ' + escapeHtml(coverClass) + '">' +
            '<img src="' + escapeHtml(post.img) + '" alt="' + escapeHtml(post.title) + '" onerror="this.remove()">' +
          '</div>' +
          '<small>' + escapeHtml(post.cat) + ' · ' + escapeHtml(post.date) + '</small>' +
          '<h3>' + escapeHtml(post.title) + '</h3>' +
          '<p>' + escapeHtml(excerpt) + '</p>' +
          '<a href="#" class="read-article" data-post="' + escapeHtml(key) + '">Read Article →</a>' +
        '</article>'
      );
    }).join('');

    // Re-apply whatever filter is currently active (default: "all")
    var activeBtn = document.querySelector('#blogFilters .filter.active');
    var filter = activeBtn ? activeBtn.dataset.filter : 'all';
    grid.querySelectorAll('.blog-card').forEach(function(item) {
      var categories = (item.dataset.category || '').split(' ');
      item.style.display = (filter === 'all' || categories.includes(filter)) ? '' : 'none';
    });
  }

  function renderAbout(about) {
    if (!about) return;

    if (Array.isArray(about.paragraphs) && about.paragraphs.length) {
      var copy = document.querySelector('#about .about-copy');
      if (copy) {
        var hireBtn = copy.querySelector('a.primary-btn');
        var hireBtnHtml = hireBtn ? hireBtn.outerHTML : '<a href="#contact" class="primary-btn" data-contact="true">Hire Me →</a>';
        // The Hire Me button's click behavior comes from the delegated
        // [data-contact="true"] listener on <body>, so no re-binding needed.
        copy.innerHTML = about.paragraphs.map(function(p) {
          return '<p class="lead">' + escapeHtml(p) + '</p>';
        }).join('') + hireBtnHtml;
      }
    }

    if (about.statNumber || about.statLabel) {
      var badge = document.querySelector('#about .about-stat-badge');
      if (badge) {
        var strong = badge.querySelector('strong');
        var small = badge.querySelector('small');
        if (strong && about.statNumber) strong.textContent = about.statNumber;
        if (small && about.statLabel) small.textContent = about.statLabel;
      }
    }
  }

  function renderResume(resume) {
    if (!resume) return;

    if (Array.isArray(resume.experience) && resume.experience.length) {
      var timeline = document.querySelector('#resume .timeline');
      if (timeline) {
        timeline.innerHTML = resume.experience.map(function(item) {
          return (
            '<article>' +
              '<span class="year">' + escapeHtml(item.year) + '</span>' +
              '<h3>' + escapeHtml(item.title) + '</h3>' +
              '<h4>' + escapeHtml(item.company) + '</h4>' +
              '<p>' + escapeHtml(item.desc) + '</p>' +
            '</article>'
          );
        }).join('');
      }
    }

    if (Array.isArray(resume.education) && resume.education.length) {
      var eduTimeline = document.querySelector('#resume .edu-timeline');
      if (eduTimeline) {
        eduTimeline.innerHTML = resume.education.map(function(item) {
          return (
            '<div class="edu-item">' +
              '<div class="edu-icon">' + escapeHtml(item.icon || '🎓') + '</div>' +
              '<div class="edu-info">' +
                '<small>' + escapeHtml(item.school) + '</small>' +
                '<strong>' + escapeHtml(item.degree) + '</strong>' +
                '<p>' + escapeHtml(item.result) + '</p>' +
              '</div>' +
            '</div>'
          );
        }).join('');
      }
    }

    if (Array.isArray(resume.skills) && resume.skills.length) {
      var skillList = document.querySelector('#resume .skill-list');
      if (skillList) {
        skillList.innerHTML = resume.skills.map(function(item) {
          var pct = parseInt(item.percent, 10) || 0;
          return (
            '<div><b>' + escapeHtml(item.name) + '</b>' +
            '<span><i style="width:' + pct + '%"></i></span>' +
            '<strong>' + pct + '%</strong></div>'
          );
        }).join('');
      }
    }
  }

  fetch('/.netlify/functions/data', { cache: 'no-store' })
    .then(function(res) {
      if (!res.ok) throw new Error('bad response');
      return res.json();
    })
    .then(function(data) {
      if (data.blogPosts) {
        // Replace the built-in blogPosts store with the live version so the
        // inline article reader (openBlogPost) shows the latest content too.
        Object.keys(blogPosts).forEach(function(k) { delete blogPosts[k]; });
        Object.keys(data.blogPosts).forEach(function(k) { blogPosts[k] = data.blogPosts[k]; });
        renderBlogCards(data.blogPosts);
      }
      if (data.projects) renderProjects(data.projects);
      if (data.about) renderAbout(data.about);
      if (data.resume) renderResume(data.resume);
    })
    .catch(function() {
      // No live data available yet (or offline) — keep the static content
      // that's already baked into this page.
    });
})();
