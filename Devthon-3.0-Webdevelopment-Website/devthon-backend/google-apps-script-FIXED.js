// FIXED Google Apps Script - Copy this ENTIRE code to your Google Apps Script
function doPost(e) {
  try {
    console.log('Received POST request');
    const data = JSON.parse(e.postData.contents);
    console.log('Parsed data:', data);
    
    // Open the spreadsheet by ID
    const spreadsheet = SpreadsheetApp.openById('1itUHfhuD0uMVmgLNorMw1Rbhqahjrhwv1_CjbP7dQII');
    console.log('Spreadsheet opened successfully');
    
    // Get or create Teams sheet with proper error handling
    let teamsSheet;
    try {
      teamsSheet = spreadsheet.getSheetByName('Teams');
    } catch (error) {
      teamsSheet = null;
    }
    
    if (!teamsSheet) {
      console.log('Creating Teams sheet...');
      teamsSheet = spreadsheet.insertSheet('Teams');
      // Add headers to Teams sheet
      const teamHeaders = [
        'Team ID', 'Team Name', 'Team Leader', 'Leader Email', 'Leader Phone',
        'Leader NIC', 'Leader College', 'Team Size', 'Registration Date'
      ];
      teamsSheet.getRange(1, 1, 1, teamHeaders.length).setValues([teamHeaders]);
      
      // Format headers
      const headerRange = teamsSheet.getRange(1, 1, 1, teamHeaders.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      
      console.log('Teams sheet created with headers');
    }
    
    // Get or create Members sheet with proper error handling
    let membersSheet;
    try {
      membersSheet = spreadsheet.getSheetByName('Members');
    } catch (error) {
      membersSheet = null;
    }
    
    if (!membersSheet) {
      console.log('Creating Members sheet...');
      membersSheet = spreadsheet.insertSheet('Members');
      // Add headers to Members sheet
      const memberHeaders = ['Team ID', 'Member Name', 'Email', 'Phone', 'NIC', 'College', 'Role'];
      membersSheet.getRange(1, 1, 1, memberHeaders.length).setValues([memberHeaders]);
      
      // Format headers
      const headerRange = membersSheet.getRange(1, 1, 1, memberHeaders.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#34a853');
      headerRange.setFontColor('white');
      
      console.log('Members sheet created with headers');
    }
    
    // Generate sequential Team ID by reading the last one
    let teamId = 'DEV-0001'; // Default for first team
    const lastRow = teamsSheet.getLastRow();
    
    if (lastRow > 1) { // If there are existing teams (besides header)
      try {
        const lastTeamId = teamsSheet.getRange(lastRow, 1).getValue().toString();
        // Extract number from format DEV-0001
        const lastNumber = parseInt(lastTeamId.split('-')[1]) || 0;
        const nextNumber = lastNumber + 1;
        teamId = `DEV-${nextNumber.toString().padStart(4, '0')}`;
        console.log(`Generated Team ID: ${teamId} (last was ${lastTeamId})`);
      } catch (error) {
        console.log('Could not parse last Team ID, using default');
      }
    }
    
    // Prepare team data
    const teamData = [
      teamId,
      data.teamName || 'N/A',
      data.teamLeader?.name || 'N/A',
      data.teamLeader?.email || 'N/A',
      data.teamLeader?.phone || '',
      data.teamLeader?.nic || '',
      data.teamLeader?.college || '',
      data.teamSize || (data.members ? data.members.length + 1 : 1),
      new Date().toLocaleString()
    ];
    
    // Add team data
    teamsSheet.appendRow(teamData);
    console.log('Team data added to Teams sheet');
    
    // Add team leader to members
    const leaderData = [
      teamId,
      data.teamLeader?.name || 'N/A',
      data.teamLeader?.email || 'N/A',
      data.teamLeader?.phone || '',
      data.teamLeader?.nic || '',
      data.teamLeader?.college || '',
      'Team Leader'
    ];
    membersSheet.appendRow(leaderData);
    console.log('Team leader added to Members sheet');
    
    // Add team members
    if (data.members && Array.isArray(data.members) && data.members.length > 0) {
      data.members.forEach((member, index) => {
        const memberData = [
          teamId,
          member.name || `Member ${index + 1}`,
          member.email || '',
          member.phone || '',
          member.nic || '',
          member.college || '',
          'Team Member'
        ];
        membersSheet.appendRow(memberData);
      });
      console.log(`${data.members.length} team members added to Members sheet`);
    }
    
    // Success response
    const response = {
      success: true,
      message: 'Registration saved to Google Sheets successfully!',
      teamId: teamId,
      teamName: data.teamName,
      timestamp: new Date().toISOString(),
      sheetsCreated: {
        teams: teamsSheet.getLastRow() - 1,
        members: membersSheet.getLastRow() - 1
      }
    };
    
    console.log('Success response:', response);
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doPost:', error);
    
    const errorResponse = {
      success: false,
      error: error.toString(),
      message: 'Failed to save registration to Google Sheets',
      timestamp: new Date().toISOString()
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test GET endpoint
function doGet() {
  const output = ContentService.createTextOutput(JSON.stringify({
    status: 'DevThon 3.0 Registration Handler is active',
    message: 'Use POST method to submit registration data',
    timestamp: new Date().toISOString(),
    spreadsheetId: '1itUHfhuD0uMVmgLNorMw1Rbhqahjrhwv1_CjbP7dQII'
  })).setMimeType(ContentService.MimeType.JSON);
  
  // Enable CORS
  return output;
}