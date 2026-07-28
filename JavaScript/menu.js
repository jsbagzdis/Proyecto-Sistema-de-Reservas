document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.carousel-track-container');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');

  
  const cantidadMovimiento = 1200; 

  if (container && btnPrev && btnNext) {
    btnNext.addEventListener('click', () => {
      container.scrollBy({
        left: cantidadMovimiento,
        behavior: 'smooth'
      });
    });

    btnPrev.addEventListener('click', () => {
      container.scrollBy({
        left: -cantidadMovimiento,
        behavior: 'smooth'
      });
    });
  }
});