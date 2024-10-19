// Quitar una unidad del carrito
function removeOne(productId) {
    fetch('/remove-one', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId })
    })
    .then(response => {
        if (response.ok) {
            Swal.fire({
                icon: 'warning',
                title: 'Producto eliminado',
                text: 'Unidad eliminada del carrito.',
                showConfirmButton: false,
                timer: 1000,
                position: 'top-end',
                toast: true,
            }).then(() => {
                location.reload();
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar una unidad.',
            showConfirmButton: false,
            timer: 1500,
            position: 'top-end',
            toast: true,
        });
    });
}

// Quitar todas las unidades del carrito
function removeAll(productId) {
    fetch('/remove-all', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId })
    })
    .then(response => {
        if (response.ok) {
            Swal.fire({
                icon: 'error',
                title: 'Producto eliminado',
                text: 'Todas las unidades quitadas del carrito.',
                showConfirmButton: false,
                timer: 1000,
                position: 'top-end',
                toast: true,
            }).then(() => {
                location.reload();
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el producto.',
            showConfirmButton: false,
            timer: 1000,
            position: 'top-end',
            toast: true,
        });
    });
}
