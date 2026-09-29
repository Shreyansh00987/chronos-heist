import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Chronos Operations Center')
    .items([
      // 1. Timelines & Eras
      S.listItem()
        .title('Timelines & Eras')
        .id('timelines-group')
        .child(
          S.list()
            .title('Timeline Management')
            .items([
              S.documentTypeListItem('era').title('Eras (1920 / 1970 / 2026)'),
              S.documentTypeListItem('timelineState').title('Timeline Integrity States'),
            ]),
        ),

      // 2. The Clockmaker's Vault & Rooms
      S.listItem()
        .title('Vault Rooms & Architecture')
        .id('rooms-group')
        .child(
          S.documentTypeList('room')
            .title('Chronos Vault Iterations')
            .filter('_type == "room"'),
        ),

      // 3. Artifacts & Game Objects
      S.listItem()
        .title('Vault Objects & Artifacts')
        .id('objects-group')
        .child(
          S.documentTypeList('gameObject')
            .title('Interactive Room Objects')
            .filter('_type == "gameObject"'),
        ),

      // 4. Temporal Actions
      S.listItem()
        .title('Temporal Actions & Mutations')
        .id('actions-group')
        .child(
          S.list()
            .title('Actions by Status')
            .items([
              S.listItem()
                .title('Pending Review')
                .child(
                  S.documentList()
                    .title('Pending Actions')
                    .filter('_type == "temporalAction" && causalityStatus == "pending"'),
                ),
              S.listItem()
                .title('Committed Actions')
                .child(
                  S.documentList()
                    .title('Committed Actions')
                    .filter('_type == "temporalAction" && causalityStatus == "committed"'),
                ),
              S.documentTypeListItem('temporalAction').title('All Temporal Actions'),
            ]),
        ),

      // 5. Causality Links
      S.listItem()
        .title('Causality Links & Matrix')
        .id('causality-group')
        .child(
          S.documentTypeList('causalityLink')
            .title('Active Causal Relationships')
            .filter('_type == "causalityLink"'),
        ),

      // 6. Paradoxes & Anomalies
      S.listItem()
        .title('Paradoxes & Anomalies')
        .id('paradox-group')
        .child(
          S.documentTypeList('paradox')
            .title('Temporal Paradoxes')
            .filter('_type == "paradox"'),
        ),

      // 7. Workflow Transitions
      S.listItem()
        .title('Causality Workflow States')
        .id('workflow-group')
        .child(
          S.documentTypeList('workflowTransition')
            .title('Workflow Pipeline Transitions')
            .filter('_type == "workflowTransition"'),
        ),

      // 8. Temporal Agents & Players
      S.listItem()
        .title('Temporal Agents & Field Operatives')
        .id('agents-group')
        .child(
          S.documentTypeList('player')
            .title('Registered Agents')
            .filter('_type == "player"'),
        ),

      // 9. Game Sessions
      S.listItem()
        .title('Active Operations / Sessions')
        .id('sessions-group')
        .child(
          S.documentTypeList('gameSession')
            .title('Game Sessions')
            .filter('_type == "gameSession"'),
        ),

      // 10. Clues & Investigation Intel
      S.listItem()
        .title('Investigation Clues & Archives')
        .id('clues-group')
        .child(
          S.documentTypeList('clue')
            .title('Discovered Clues')
            .filter('_type == "clue"'),
        ),
    ])
