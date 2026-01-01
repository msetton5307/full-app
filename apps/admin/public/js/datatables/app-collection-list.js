$(function () {
  const collectionTable = $('.collection-list-table');

  if (!collectionTable.length) {
    return;
  }

  const getStatusBadge = (status) => {
    const normalizedStatus = (status || '').toLowerCase();
    const badgeMap = {
      active: 'success',
      inactive: 'secondary',
    };
    const color = badgeMap[normalizedStatus] || 'light';
    const label = status ? status : 'N/A';
    return `<span class="badge rounded-pill badge-light-${color} text-capitalize">${label}</span>`;
  };

  const formatCover = (cover) => {
    if (!cover) {
      return '<img src="/uploads/noImage.png" class="rounded" style="height: 40px; width: 40px; object-fit: cover;" />';
    }
    return `<img src="/uploads/collections/${cover}" class="rounded" style="height: 40px; width: 40px; object-fit: cover;" />`;
  };

  const actionButtons = (id, status) => {
    if (!id) return '';
    const toggleIcon = status === 'Active' ? 'slash' : 'check';
    const toggleTitle = status === 'Active' ? 'Deactivate' : 'Activate';
    return (
      `<div class="d-flex align-items-center column-action">` +
      `<a class="me-1" href="/collection/edit/${id}" title="Edit"><i data-feather="edit"></i></a>` +
      `<a class="me-1" href="/collection/status-change/${id}" title="${toggleTitle}"><i data-feather="${toggleIcon}"></i></a>` +
      `<a class="me-1" href="/collection/delete/${id}" title="Delete" onclick="return confirm('Are you sure you want to delete this collection?');"><i data-feather="trash"></i></a>` +
      `</div>`
    );
  };

  const dataTable = collectionTable.DataTable({
    processing: true,
    serverSide: true,
    searching: true,
    ordering: true,
    ajax: {
      url: '/collection/getall',
      type: 'POST',
      data: function (d) {
        const status = $('#CollectionStatusDropdown').val();
        if (Array.isArray(d.columns)) {
          const statusColumn = d.columns.find((column) => column.data === 'status');
          if (statusColumn && statusColumn.search) {
            statusColumn.search.value = status || '';
          }
        }
        return d;
      },
      dataSrc: function (json) {
        return json && Array.isArray(json.data) ? json.data : [];
      },
      error: function () {
        toastr['error']('Unable to load collections at the moment.', 'Error!');
      }
    },
    columns: [
      { data: '_id' },
      { data: 'coverImage' },
      { data: 'title' },
      { data: 'dealsCount' },
      { data: 'status' },
      { data: '_id' }
    ],
    order: [[2, 'desc']],
    columnDefs: [
      {
        targets: 0,
        orderable: false,
        searchable: false,
        responsivePriority: 1,
        render: function (data, type, full, meta) {
          return meta.row + 1 + meta.settings._iDisplayStart;
        }
      },
      {
        targets: 1,
        orderable: false,
        searchable: false,
        render: function (data) {
          return formatCover(data);
        }
      },
      {
        targets: 2,
        responsivePriority: 2,
        render: function (data) {
          return data || 'N/A';
        }
      },
      {
        targets: 3,
        render: function (data) {
          return data || 0;
        }
      },
      {
        targets: 4,
        render: function (data) {
          return getStatusBadge(data);
        }
      },
      {
        targets: 5,
        orderable: false,
        searchable: false,
        responsivePriority: 3,
        render: function (data, type, full) {
          return actionButtons(data, full.status);
        }
      }
    ],
    drawCallback: function () {
      feather.replace();
    }
  });

  $('#CollectionStatusDropdown').on('change', function () {
    dataTable.ajax.reload();
  });
});
