import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Pagination from 'react-bootstrap/Pagination';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Button from 'react-bootstrap/Button';

function App() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const entriesPerPage = 10;

  useEffect(() => {
    const url = `${process.env.PUBLIC_URL}/MOCK_DATA.csv`;
    axios.get(url)
      .then(response => {
        const csvData = response.data;
        const csvContactArray = parseCSV(csvData);
        setContacts(csvContactArray);
      })
      .catch(error => {
        console.error('Error fetching data from CSV file:', error);
      });
  }, []);

  const parseCSV = (csvString) => {
    const lines = csvString.split('\n');
    if (lines.length < 2) {
      return [];
    }

    const headers = lines[0].split(',');

    return lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, index) => {
        const trimmedHeader = header.trim();
        obj[trimmedHeader] = values[index] ? values[index].trim() : '';
        return obj;
      }, {});
    });
  };

  const handleSearchChange = (e) => {
    setCurrentPage(1);
    setSearch(e.target.value);
  };

  const matchCharacters = (haystack, needle) => {
    const needleChars = [...needle];
    return needleChars.every(char => haystack.includes(char));
  };

  const filteredContacts = contacts.filter((contact) =>
    matchCharacters(contact.first_name.toLowerCase(), search.toLowerCase()) ||
    matchCharacters(contact.last_name.toLowerCase(), search.toLowerCase()) ||
    matchCharacters(contact.phone.toLowerCase(), search.toLowerCase())
  );

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredContacts.slice(indexOfFirstEntry, indexOfLastEntry);

  const totalPages = Math.ceil(filteredContacts.length / entriesPerPage);
  const maxPaginationItems = 10;

  const toggleSelectContact = (contact) => {
    const isSelected = selectedContacts.includes(contact);
    if (isSelected) {
      setSelectedContacts(selectedContacts.filter((selected) => selected !== contact));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const renderEntries = currentEntries.map((item, index) => (
    <tr key={index}>
      <td className="text-center">
        <Form.Check
          type="checkbox"
          checked={selectedContacts.includes(item)}
          onChange={() => toggleSelectContact(item)}
          style={{ transform: 'scale(0.8)' }}
        />
      </td>
      <td>{item.first_name}</td>
      <td>{item.last_name}</td>
      <td>{item.email}</td>
      <td>{item.phone}</td>
      <td>
        <button onClick={() => downloadContact(item)}>Download</button>
      </td>
    </tr>
  ));

  const renderPaginationItems = () => {
    const items = [];
    const startPage = Math.max(1, currentPage - Math.floor(maxPaginationItems / 2));
    const endPage = Math.min(totalPages, startPage + maxPaginationItems - 1);

    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => setCurrentPage(number)}
        >
          {number}
        </Pagination.Item>,
      );
    }

    if (currentPage > Math.floor(maxPaginationItems / 2) + 1) {
      items.unshift(
        <Pagination.Prev
          key="prev"
          onClick={() => setCurrentPage(currentPage - 1)}
        />
      );
    }

    if (currentPage < totalPages - Math.floor(maxPaginationItems / 2)) {
      items.push(
        <Pagination.Next
          key="next"
          onClick={() => setCurrentPage(currentPage + 1)}
        />
      );
    }

    return items;
  };

  const downloadContact = (contact) => {
    const csvString = Object.values(contact).join(',');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${contact.first_name}_${contact.last_name}_contact.csv`;
    link.click();
  };

  return (
    <div>
      <Container>
        <h1 className='text-center mt-4 mb-4'>
          Contacts &nbsp;&nbsp;
          <Button
            variant="outline-dark"
            className="float-right"
            onClick={() => console.log('Add Contacts clicked')} // You can add your logic here
          >
            + Add Contacts
          </Button>
        </h1>

        <Form className="mb-3">
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search contacts"
              value={search}
              onChange={handleSearchChange}
            />
          </InputGroup>
        </Form>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th className="text-center">Check</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {renderEntries}
          </tbody>
        </Table>

        <div className="d-flex justify-content-center">
          <Pagination>
            {renderPaginationItems()}
          </Pagination>
        </div>
      </Container>
    </div>
  );
}

export default App;
