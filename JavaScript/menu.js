document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.carousel-track-container');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');

  
  const scrollAmount = 1200; 

  if (container && btnPrev && btnNext) {
    btnNext.addEventListener('click', () => {
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    });

    btnPrev.addEventListener('click', () => {
      container.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    });
  }
});