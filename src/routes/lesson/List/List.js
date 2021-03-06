import React from 'react'
import PropTypes from 'prop-types'
import { Menu, Modal, Tag, Icon } from 'antd'
import moment from 'moment'
import classnames from 'classnames'
import { Link } from 'dva/router'
import { DataTable, DropMenu } from 'components'
import { UPDATE, DETAIL, DELETE } from 'constants/options'
import { getSubject } from 'utils/dictionary'
import { isMobile } from 'utils'
import styles from './List.less'

const confirm = Modal.confirm
let selectedKeys = []
const now = +moment().format('X')

function List ({
  lessonList: {
    list,
    pagination,
  },
  loading,
  onPageChange,
  updatePower,
  detailPower,
  deletePower,
  onDeleteItem,
  onDeleteCourseItem,
  onDeleteBatch,
}) {
  const handleMenuClick = (key, record) => {
    if (+key === DELETE) {
      confirm({
        title: '您确定要删除课程吗?',
        onOk () {
          onDeleteItem({ lessonid: record.id })
        },
      })
    }
    if (key === `${DELETE}_course`) {
      confirm({
        title: '您确定要删除课程系列吗?',
        onOk () {
          onDeleteCourseItem({ courseid: record.course })
        },
      })
    }
  }

  const rowSelection = {
    onChange: (selectedRowKeys) => {
      selectedKeys = selectedRowKeys
    },
    getCheckboxProps: record => ({
      disabled: record.category_idnumber.includes('-jp-'),
    }),
    selections: [{
      key: 'deleteAll',
      text: <Tag color="#f50"><Icon type="delete" /> 批量删除</Tag>,
      onSelect: () => {
        if (selectedKeys.length) {
          confirm({
            title: '您确定要批量删除这些记录吗?',
            onOk () {
              onDeleteBatch({ lessonids: selectedKeys.join(',') })
            },
          })
        } else {
          Modal.warning({
            title: '警告',
            content: '请至少选中一条记录！',
          })
        }
      },
    }],
  }

  const columns = [
    {
      title: '课程名称',
      dataIndex: 'category_summary',
      key: 'category_summary',
      render: (title, record) => (
        <span className={classnames(record.available < now && styles.title)}>{title}</span>
      ),
      sorter: (a, b) => a.category_summary.localeCompare(b.category_summary),
    }, {
      title: '开课时间',
      dataIndex: 'available',
      key: 'available',
      render: (available, record) => (
        <span className={classnames(record.available < now && styles.title)}>{moment.unix(available).format('YYYY-MM-DD')}<br />{moment.unix(available).format('HH:mm')} - {moment.unix(record.deadline).format('HH:mm')}</span>
      ),
      sorter: (a, b) => a.available - b.available,
    }, {
      title: '科目',
      dataIndex: 'category_idnumber',
      key: 'category_idnumber',
      render: subject => <span>{getSubject(subject.split('-')[0])}</span>,
      sorter: (a, b) => a.category_idnumber.localeCompare(b.category_idnumber),
    }, {
      title: '教室',
      dataIndex: 'classroom',
      key: 'classroom',
      sorter: (a, b) => a.classroom.localeCompare(b.classroom),
    }, {
      title: '老师',
      dataIndex: 'teacher_alternatename',
      key: 'teacher_alternatename',
      sorter: (a, b) => a.teacher_alternatename.localeCompare(b.teacher_alternatename),
    }, {
      title: '已选学生人数',
      dataIndex: 'num_student',
      key: 'num_student',
      render: (numStudent, record) => <span>{numStudent} / {record.category_upperlimit}</span>,
    }, {
      title: '操作',
      key: 'operation',
      // width: 80,
      render: (text, record) => (
        <DropMenu>
          <Menu onClick={({ key }) => handleMenuClick(key, record)}>
            {detailPower && <Menu.Item key={DETAIL}><Link to={`/lesson/detail?lessonid=${record.id}`}>查看</Link></Menu.Item>}
            {updatePower && <Menu.Item key={UPDATE}><Link to={`/lesson/update?lessonid=${record.id}`}>编辑</Link></Menu.Item>}
            {deletePower && <Menu.Item key={DELETE}>删除</Menu.Item>}
            {deletePower && <Menu.Item key={`${DELETE}_course`}>删除系列</Menu.Item>}
          </Menu>
        </DropMenu>
      ),
      // fixed: 'right'
    },
  ]

  return (
    <DataTable
      className={classnames(styles.table, !deletePower && styles.no_row)}
      columns={columns}
      dataSource={list}
      loading={loading}
      pagination={pagination}
      onPageChange={onPageChange}
      rowSelection={deletePower ? rowSelection : null}
      scroll={{ x: isMobile() ? 600 : 1200 }}
      rowKey={record => record.id}
    />
  )
}

List.propTypes = {
  lessonList: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onPageChange: PropTypes.func.isRequired,
  updatePower: PropTypes.bool.isRequired,
  detailPower: PropTypes.bool.isRequired,
  deletePower: PropTypes.bool.isRequired,
  onDeleteItem: PropTypes.func.isRequired,
  onDeleteCourseItem: PropTypes.func.isRequired,
  onDeleteBatch: PropTypes.func.isRequired,
}

export default List
