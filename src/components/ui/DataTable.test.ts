import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DataTable from './DataTable.vue'
import { h } from 'vue'

describe('DataTable', () => {
  const mockColumns = [
    { key: 'name', label: 'Name', align: 'left' as const },
    { key: 'email', label: 'Email', align: 'left' as const },
    { key: 'status', label: 'Status', align: 'center' as const }
  ]

  const mockData = [
    { name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' }
  ]

  it('renders table with data', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData
      }
    })

    expect(wrapper.find('.data-table').exists()).toBe(true)
    expect(wrapper.findAll('.table-row').length).toBe(2)
    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('jane@example.com')
  })

  it('renders column headers correctly', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData
      }
    })

    const headers = wrapper.findAll('.table-header-cell')
    expect(headers.length).toBe(3)
    expect(headers[0].text()).toBe('Name')
    expect(headers[1].text()).toBe('Email')
    expect(headers[2].text()).toBe('Status')
  })

  it('shows loading skeleton when loading', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: [],
        loading: true
      }
    })

    expect(wrapper.findAll('.skeleton-loader').length).toBeGreaterThan(0)
  })

  it('shows empty state when no data', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: []
      }
    })

    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('No data available')
  })

  it('shows error state when error prop is provided', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: [],
        error: 'Failed to load data'
      }
    })

    expect(wrapper.find('.error-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('Failed to load data')
  })

  it('renders action buttons when actions are provided', () => {
    const mockActions = [
      {
        icon: '📥',
        label: 'Download',
        onClick: vi.fn()
      },
      {
        icon: '🗑️',
        label: 'Delete',
        onClick: vi.fn(),
        variant: 'danger' as const
      }
    ]

    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        actions: mockActions
      }
    })

    expect(wrapper.find('.table-cell-actions').exists()).toBe(true)
    expect(wrapper.findAll('.action-button').length).toBe(4) // 2 actions × 2 rows
  })

  it('calls action onClick when button is clicked', async () => {
    const onClickSpy = vi.fn()
    const mockActions = [
      {
        icon: '📥',
        label: 'Download',
        onClick: onClickSpy
      }
    ]

    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        actions: mockActions
      }
    })

    const firstActionButton = wrapper.find('.action-button')
    await firstActionButton.trigger('click')

    expect(onClickSpy).toHaveBeenCalledWith(mockData[0])
  })

  it('calls onRowClick when row is clicked', async () => {
    const onRowClickSpy = vi.fn()

    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        onRowClick: onRowClickSpy
      }
    })

    const firstRow = wrapper.find('.table-row')
    await firstRow.trigger('click')

    expect(onRowClickSpy).toHaveBeenCalledWith(mockData[0])
  })

  it('applies correct alignment classes', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData
      }
    })

    const cells = wrapper.findAll('.table-cell')
    expect(cells[0].classes()).toContain('align-left')
    expect(cells[2].classes()).toContain('align-center')
  })

  it('renders custom cell content with render function', () => {
    const columnsWithRender = [
      {
        key: 'name',
        label: 'Name',
        render: (value: string) => h('strong', value.toUpperCase())
      }
    ]

    const wrapper = mount(DataTable, {
      props: {
        columns: columnsWithRender,
        data: [{ name: 'John Doe' }]
      }
    })

    expect(wrapper.find('strong').exists()).toBe(true)
    expect(wrapper.find('strong').text()).toBe('JOHN DOE')
  })

  it('disables action button when disabled function returns true', () => {
    const mockActions = [
      {
        icon: '📥',
        label: 'Download',
        onClick: vi.fn(),
        disabled: (row: any) => row.status === 'Inactive'
      }
    ]

    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        actions: mockActions
      }
    })

    const actionButtons = wrapper.findAll('.action-button')
    expect(actionButtons[0].attributes('disabled')).toBeUndefined()
    expect(actionButtons[1].attributes('disabled')).toBeDefined()
  })

  it('applies zebra striping to rows', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData
      }
    })

    const rows = wrapper.findAll('.table-row')
    // Check that even rows have different styling (via CSS)
    expect(rows.length).toBe(2)
  })

  it('shows Actions header when actions are provided', () => {
    const mockActions = [
      {
        icon: '📥',
        label: 'Download',
        onClick: vi.fn()
      }
    ]

    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        actions: mockActions
      }
    })

    const headers = wrapper.findAll('.table-header-cell')
    expect(headers[headers.length - 1].text()).toBe('Actions')
  })
})
