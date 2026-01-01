$(function () {
  const userTable = $('.user-list-table');

  if (!userTable.length) {
    return;
  }

  const getStatusBadge = (status) => {
    const normalizedStatus = (status || '').toLowerCase();
    const badgeMap = {
      unblock: 'success',
      block: 'danger',
      banned: 'warning'
    };
    const color = badgeMap[normalizedStatus] || 'secondary';
    const label = status ? status : 'N/A';
    return `<span class="badge rounded-pill badge-light-${color} text-capitalize">${label}</span>`;
  };

  const formatDate = (value) => {
    if (!value) return '';
    return moment(value).format('DD MMM YYYY, hh:mm A');
  };

  const actionButtons = (id) => {
    if (!id) return '';
    return (
      `<div class="d-flex align-items-center column-action">` +
      `<a class="me-1" href="/user/view/${id}" title="View"><i data-feather="eye"></i></a>` +
      `<a class="me-1" href="/user/edit/${id}" title="Edit"><i data-feather="edit"></i></a>` +
      `</div>`
    );
  };

  const dataTable = userTable.DataTable({
    processing: true,
    serverSide: true,
    searching: true,
    ordering: true,
    ajax: {
      url: '/user/getall',
      type: 'POST',
      data: function (d) {
        const status = $('#StatusDropdown').val();
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
        toastr['error']('Unable to load users at the moment.', 'Error!');
      }
    },
    columns: [
      { data: '_id' },
      { data: 'fullName' },
      { data: 'createdAt' },
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
        responsivePriority: 2,
        render: function (data, type, full) {
          const name = data || 'N/A';
          const email = full.email ? `<small class="text-muted">${full.email}</small>` : '';
          return `<div class="d-flex flex-column"><span class="fw-bolder">${name}</span>${email}</div>`;
        }
      },
      {
        targets: 2,
        render: function (data) {
          return formatDate(data);
        }
      },
      {
        targets: 3,
        render: function (data) {
          return getStatusBadge(data);
        }
      },
      {
        targets: 4,
        orderable: false,
        searchable: false,
        responsivePriority: 3,
        render: function (data) {
          return actionButtons(data);
        }
      }
    ],
    drawCallback: function () {
      feather.replace();
    }
  });

  $('#StatusDropdown').on('change', function () {
    dataTable.ajax.reload();
  });
});
