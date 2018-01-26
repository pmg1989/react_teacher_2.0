import React from 'react'
import PropTypes from 'prop-types'
import { Form, Row, Col, Select, DatePicker } from 'antd'
import moment from 'moment'
import { SearchGroup } from 'components'
import { getSchool } from 'utils'

const FormItem = Form.Item
const Option = Select.Option
const { MonthPicker } = DatePicker

const Search = ({
  schools,
  onSearch,
  form: {
    getFieldDecorator,
    getFieldsValue,
  },
}) => {
  const searchGroupProps = {
    size: 'large',
    select: true,
    selectOptions: [
      { value: 'student_name', name: '姓名' },
      { value: 'student_idnumber', name: '学号' },
      { value: 'category_summary', name: '课程名称' },
    ],
    selectProps: {
      defaultValue: 'student_name',
    },
    onSearch: (value) => {
      const fieldsValue = getFieldsValue()
      fieldsValue.keyword = value.keyword
      fieldsValue.field = value.field
      fieldsValue.isPostBack = false
      onSearch(fieldsValue)
    },
  }

  const handleChange = () => {
    setTimeout(() => {
      const params = getFieldsValue()
      params.deadline = params.deadline.endOf('month').format('X')
      params.isPostBack = true
      onSearch(params)
    }, 0)
  }

  return (
    <Row gutter={24}>
      <Col>
        <Form layout="inline">
          <FormItem label="校区" style={{ marginBottom: 20, marginRight: 40 }}>
            {getFieldDecorator('school', {
              initialValue: getSchool(),
              onChange: handleChange,
            })(<Select style={{ width: 90 }} disabled={getSchool() !== 'global'}>
              <Option value="">全部</Option>
              {schools.map(item => <Option key={item.id} value={item.school}>{item.name}</Option>)}
            </Select>)
            }
          </FormItem>
          <FormItem label="时间" style={{ marginBottom: 20, marginRight: 40 }}>
            {getFieldDecorator('deadline', {
              initialValue: moment().endOf('month'),
              onChange: handleChange,
            })(
              <MonthPicker placeholder="--请选择月份--" />
            )}
          </FormItem>
          <FormItem style={{ marginBottom: 20, marginRight: 0 }}>
            <SearchGroup {...searchGroupProps} />
          </FormItem>
        </Form>
      </Col>
    </Row>
  )
}

Search.propTypes = {
  form: PropTypes.object.isRequired,
  schools: PropTypes.array.isRequired,
  onSearch: PropTypes.func.isRequired,
}

export default Form.create()(Search)
