$(document).ready(function () {
    const table = $("table");

    if (table.length && table.find("tbody tr").length > 0) {
        table.DataTable({
            columnDefs: [{
                "defaultContent": "",
                "targets": "_all"
              }],
            order: [0, 'asc'],
            searching: false,
            pageLength: 10,
            language: {
                lengthMenu: "_MENU_ entradas por pagina",
                info: "Mostrando _START_ a _END_ de _TOTAL_ entradas",
            },
        });
    } else {
        table.hide();
    }
});