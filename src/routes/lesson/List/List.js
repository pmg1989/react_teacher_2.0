import React from 'react'
import PropTypes from 'prop-types'
import { Menu } from 'antd'
import moment from 'moment'
import { DataTable, DropMenu } from 'components'
import { DETAIL, UPDATE } from 'constants/options'
import { getSubject } from 'utils/dictionary'
import styles from './List.less'

function List ({
  lessonList: {
    list,
    pagination,
  },
  loading,
  onPageChange,
  detailPower,
  // updatePower,
  onDetailItem,
  onEditItem,
}) {
  const handleMenuClick = (key, record) => {
    return {
      [DETAIL]: onDetailItem,
      [UPDATE]: onEditItem,
    }[key](record)
  }

  const columns = [
    {
      title: '课程名称',
      dataIndex: 'category_summary',
      key: 'category_summary',
    }, {
      title: '开课时间',
      dataIndex: 'available',
      key: 'available',
      render: (available, record) => (<span>{moment.unix(available).format('YYYY-MM-DD')}<br />{moment.unix(available).format('HH:mm')} - {moment.unix(record.deadline).format('HH:mm')}</span>),
    }, {
      title: '科目',
      dataIndex: 'category_idnumber',
      key: 'category_idnumber',
      render: subject => <span>{getSubject(subject.split('-')[0])}</span>,
    }, {
      title: '教室',
      dataIndex: 'classroom',
      key: 'classroom',
    }, {
      title: '老师',
      dataIndex: 'teacher',
      key: 'teacher',
    }, {
      title: '已选学生人数',
      dataIndex: 'num_student',
      key: 'num_student',
      render: (numStudent, record) => <span>{numStudent} / {record.category_upperlimit}</span>,
    }, {
      title: '校区',
      dataIndex: 'school',
      key: 'school',
      // render: school => <span>{schools.find(item => item.school === school).name}</span>,
    }, {
      title: '操作',
      key: 'operation',
      // width: 80,
      render: (text, record) => (
        <DropMenu>
          <Menu onClick={({ key }) => handleMenuClick(key, record)}>
            {detailPower && <Menu.Item key={DETAIL}>查看</Menu.Item>}
            {/* {updatePower && <Menu.Item key={UPDATE}>编辑</Menu.Item>} */}
          </Menu>
        </DropMenu>
      ),
      // fixed: 'right'
    },
  ]

  return (
    <DataTable
      className={styles.table}
      columns={columns}
      dataSource={list}
      loading={loading}
      pagination={pagination}
      onPageChange={onPageChange}
      rowKey={record => record.id}
    />
  )
}

List.propTypes = {
  lessonList: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  detailPower: PropTypes.bool.isRequired,
  onPageChange: PropTypes.func.isRequired,
  // updatePower: PropTypes.bool.isRequired,
  onDetailItem: PropTypes.func.isRequired,
  onEditItem: PropTypes.func.isRequired,
}

export default List
