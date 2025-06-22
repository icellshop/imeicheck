function executeScriptsFromPartial(container) {
  const scripts = container.querySelectorAll('script');
  scripts.forEach(oldScript => {
    const newScript = document.createElement('script');
    // Copia el código/atributos
    if (oldScript.src) {
      newScript.src = oldScript.src;
    } else {
      newScript.textContent = oldScript.textContent;
    }
    // Asegura que el tipo de script sea el mismo
    if (oldScript.type) newScript.type = oldScript.type;
    // Remplaza en el DOM
    document.body.appendChild(newScript);
    document.body.removeChild(newScript);
  });
}