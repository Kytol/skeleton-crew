# Implementation Plan

- [x] 1. Set up project structure and shared infrastructure




  - [x] 1.1 Initialize Angular library project with standalone components configuration


    - Create Angular workspace with library project
    - Configure package.json with library metadata
    - Set up tsconfig for library builds
    - _Requirements: 1.3, 1.4_

  - [x] 1.2 Create theme system with CSS variables

    - Create theme CSS file with light and dark theme variables
    - Implement ThemeService for programmatic theme switching
    - _Requirements: 1.1, 1.2, 1.3, 1.4_


  - [x] 1.3 Create shared types and interfaces

    - Define all component interfaces in shared types file
    - Create common utility types (ButtonVariant, ButtonSize, etc.)

    - _Requirements: 2.1, 3.1, 4.1, 5.1, 6.1_
  - [x] 1.4 Set up base styles and design tokens

    - Create CSS variables for radius scale, font sizes, shadows, spacing
    - Set up Inter font import and typography styles
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [x] 1.5 Configure testing infrastructure








    - Install and configure fast-check for property-based testing
    - Set up test utilities and common test helpers
    - _Requirements: All_
-

- [-] 2. Implement Button Component


  - [x] 2.1 Create Button component with variant and size inputs



    - Implement ui-button standalone component
    - Add variant input with primary/secondary/outline options
    - Add size input with sm/md/lg options and corresponding padding
    - Apply CSS classes based on variant and size
    - _Requirements: 2.1, 2.2_
  - [ ] 2.2 Write property tests for Button variant and size


    - **Property 1: Button variant applies correct CSS class**
    - **Property 2: Button size applies correct padding** 
    - **Validates: Requirements 2.1, 2.2**

  - [x] 2.3 Add disabled and loading states to Button


    - Implement disabled input with visual state and interaction blocking
    - Implement loading input with spinner overlay and click blocking
    - _Requirements: 2.3, 2.4_
  - [ ] 2.4 Write property tests for Button disabled and loading states


    - **Property 3: Disabled state prevents interaction (Button)**
    - **Property 4: Loading state blocks button clicks**
    - **Validates: Requirements 2.3, 2.4**
  - [x] 2.5 Add icon support to Button







    - Implement iconLeft and iconRight inputs
    - Handle icon-only button padding adjustment
    - _Requirements: 2.5, 2.7_
  - [x] 2.6 Write property test for Button icon positioning





    - **Property 5: Icon inputs render in correct positions (Button)**
    - **Validates: Requirements 2.5**
  - [x] 2.7 Add keyboard accessibility to Button



    - Implement Enter and Space key handlers
    - Add proper tabindex and ARIA attributes
    - _Requirements: 2.6, 7.1, 7.2_
  - [x] 2.8 Write property tests for Button keyboard and accessibility




    - **Property 6: Keyboard activation triggers button click**
    - **Property 23: Components support keyboard focus (Button)**
    - **Property 24: ARIA labels present on icon elements (Button)**
    - **Validates: Requirements 2.6, 7.1, 7.2**

- [x] 3. Checkpoint - Ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement Input Component

  - [x] 4.1 Create Input component with label and basic inputs


    - Implement ui-input standalone component
    - Add label input with proper label element association
    - Add placeholder, type, value, and disabled inputs
    - Implement valueChange output
    - _Requirements: 3.1, 3.4, 3.5, 3.6_
  - [ ]* 4.2 Write property tests for Input label and value
    - **Property 7: Input label association**
    - **Property 9: Input value change emission**
    - **Property 3: Disabled state prevents interaction (Input)**
    - **Validates: Requirements 3.1, 3.4, 3.5**
  - [x] 4.3 Add error state and icon support to Input


    - Implement error input with error message display and styling
    - Implement prefixIcon and suffixIcon inputs
    - Add border transition styling
    - _Requirements: 3.2, 3.3, 3.7_
  - [ ]* 4.4 Write property tests for Input error and icons
    - **Property 8: Input error state display**
    - **Property 5: Icon inputs render in correct positions (Input)**
    - **Validates: Requirements 3.2, 3.3**

- [ ] 5. Implement Search Component

  - [x] 5.1 Create Search component with debounce functionality


    - Implement ui-search standalone component
    - Add placeholder, value, debounce, and disabled inputs
    - Implement debounced valueChange output using RxJS
    - Add search icon in left position
    - _Requirements: 6.1, 6.2, 6.3, 6.5_
  - [ ]* 5.2 Write property tests for Search debounce
    - **Property 21: Search debounce delays emission**
    - **Property 3: Disabled state prevents interaction (Search)**
    - **Validates: Requirements 6.1, 6.2, 6.5**
  - [x] 5.3 Add Escape key clear functionality to Search


    - Implement Escape key handler to clear value
    - Emit valueChange with empty string on clear
    - _Requirements: 6.4_
  - [ ]* 5.4 Write property test for Search escape clear
    - **Property 22: Search escape clears value**
    - **Validates: Requirements 6.4**

- [x] 6. Checkpoint - Ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement Calendar Component

  - [x] 7.1 Create Calendar component with grid and navigation


    - Implement ui-calendar standalone component
    - Create calendar grid (7 columns × 6 rows)
    - Implement month/year navigation with previous/next buttons
    - Highlight today's date
    - _Requirements: 4.3, 4.6_
  - [ ]* 7.2 Write property test for Calendar navigation
    - **Property 12: Calendar month navigation round-trip**
    - **Validates: Requirements 4.3**
  - [x] 7.3 Implement single and range date selection modes


    - Add mode input for 'single' and 'range'
    - Implement single date selection logic
    - Implement range selection with start/end dates
    - Emit valueChange with selected date(s)
    - _Requirements: 4.1, 4.2, 4.8_
  - [ ]* 7.4 Write property tests for Calendar selection modes
    - **Property 10: Calendar single mode maintains single selection**
    - **Property 11: Calendar range mode maintains two-date selection**
    - **Validates: Requirements 4.1, 4.2**
  - [x] 7.5 Add date constraints and time picker


    - Implement minDate and maxDate inputs
    - Disable dates outside valid range
    - Add optional time picker when showTime=true
    - _Requirements: 4.4, 4.5_
  - [ ]* 7.6 Write property test for Calendar date constraints
    - **Property 13: Calendar date constraints enforcement**
    - **Validates: Requirements 4.4**
  - [x] 7.7 Add keyboard navigation to Calendar


    - Implement arrow key navigation between dates
    - Add proper focus management
    - _Requirements: 4.7, 7.1, 7.4_
  - [ ]* 7.8 Write property tests for Calendar keyboard navigation
    - **Property 14: Calendar keyboard navigation**
    - **Property 23: Components support keyboard focus (Calendar)**
    - **Validates: Requirements 4.7, 7.1**

- [x] 8. Checkpoint - Ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement Table Component

  - [x] 9.1 Create Table component with column rendering


    - Implement ui-table standalone component
    - Add columns and data inputs
    - Render table headers based on column configuration
    - Handle column visibility (visible property)
    - _Requirements: 5.1_
  - [ ]* 9.2 Write property test for Table column rendering
    - **Property 15: Table column rendering matches configuration**
    - **Validates: Requirements 5.1**
  - [x] 9.3 Implement sorting functionality

    - Add sortable input and per-column sortable property
    - Implement sort direction toggle (null → asc → desc → null)
    - Emit sortChange event with field and direction
    - Display sort indicators in column headers
    - _Requirements: 5.2_
  - [ ]* 9.4 Write property test for Table sorting
    - **Property 16: Table sort toggle cycle**
    - **Validates: Requirements 5.2**
  - [x] 9.5 Implement pagination

    - Add pageSize input with default page sizes (10, 25, 50, 100)
    - Create pagination bar with prev/next and page numbers
    - Emit pageChange event with page and pageSize
    - _Requirements: 5.3_
  - [ ]* 9.6 Write property test for Table pagination
    - **Property 17: Table pagination event emission**
    - **Validates: Requirements 5.3**
  - [x] 9.7 Integrate search functionality

    - Add searchable input
    - Integrate ui-search component
    - Emit searchChange event on search input
    - _Requirements: 5.4_
  - [ ]* 9.8 Write property test for Table search
    - **Property 18: Table search event emission**
    - **Validates: Requirements 5.4**
  - [x] 9.9 Implement column visibility manager

    - Add columnManager input
    - Create dropdown panel with column checkboxes
    - Emit columnVisibilityChange event on toggle
    - _Requirements: 5.5, 5.6_
  - [ ]* 9.10 Write property test for Table column visibility
    - **Property 19: Table column visibility event emission**
    - **Validates: Requirements 5.6**
  - [x] 9.11 Implement server mode

    - Add serverMode input
    - Emit events without internal data processing when enabled
    - _Requirements: 5.7_
  - [ ]* 9.12 Write property test for Table server mode
    - **Property 20: Table server mode delegates to events**
    - **Validates: Requirements 5.7**
  - [x] 9.13 Add Table keyboard navigation and accessibility

    - Implement keyboard navigation for table rows
    - Add proper ARIA attributes for table structure
    - Add row click event emission
    - _Requirements: 7.1, 7.4_
  - [ ]* 9.14 Write property test for Table accessibility
    - **Property 23: Components support keyboard focus (Table)**
    - **Validates: Requirements 7.1**

- [x] 10. Checkpoint - Ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Apply dark mode styling to all components

  - [x] 11.1 Update all components with dark mode CSS


    - Apply --color-surface for headers and surfaces
    - Apply rgba(255,255,255,0.05) for hover states
    - Apply --color-border for borders
    - Ensure focus outlines visible in both themes
    - _Requirements: 1.2, 5.8, 7.3_

- [x] 12. Final Checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.
