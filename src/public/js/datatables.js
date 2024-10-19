$(document).ready(function () {
    $("table").DataTable({
        order: [0, 'asc'],
        searching: false,
        pageLength: 10,
        language: {
            lengthMenu: "_MENU_ entradas por pagina",
            info: "Mostrando _START_ a _END_ de _TOTAL_ entradas",
        },
    });
});