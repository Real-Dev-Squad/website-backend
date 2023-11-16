import {
  GroupedFilterQueries,
  GroupedSortQueries,
  Operators,
  Queries,
  QueryTypes,
} from "../typeDefinitions/rqlParser";

const KEY_VALUE_PAIR_DELIMITER_PATTERN = /\s+/;
const KEY_VALUE_DELIMITER = ":";
const SORT_DELIMITER = "-";
const EXCLUDE_SYMBOL = "-";
const SORT_KEY = "sort";

export class RQLQueryParser {
  private queryString: string;
  private parsedQueriesList: Queries[];

  constructor(queryString: string) {
    this.queryString = queryString;
    this.parsedQueriesList = this.parseQueries();
  }

  private parseKeyValue(keyValuePair: string): Queries {
    const [key, value] = keyValuePair.split(KEY_VALUE_DELIMITER);

    if (!key || !value) {
      throw TypeError("Expected a value, but found empty string.");
    }
    const query: Queries = {
      operator: Operators.INCLUDE,
      value: value.trim(),
      type: QueryTypes.FILTER,
      key: key.trim(),
    };

    if (query.key === SORT_KEY) {
      const [key, value] = query.value.split(SORT_DELIMITER);
      query.key = key.trim();
      query.value = value.trim();
      query.type = QueryTypes.SORT;
    }

    if (query.type === QueryTypes.FILTER && query.key.charAt(0) === EXCLUDE_SYMBOL) {
      query.key = query.key.substring(1);
      query.operator = Operators.EXCLUDE;
    }

    return query;
  }

  private parseQueries(): Queries[] {
    const parsedQueriesList: Queries[] = [];
    if (!this.queryString) {
      return parsedQueriesList;
    }
    try {
      const queryList = this.queryString.split(KEY_VALUE_PAIR_DELIMITER_PATTERN);

      for (const query of queryList) {
        parsedQueriesList.push(this.parseKeyValue(query));
      }
    } catch (error) {
      logger.error(`Error occurred while parsing query params ${error}`);
      throw Error("Invalid query param format");
    }
    return parsedQueriesList;
  }

  getFilterQueries(): GroupedFilterQueries {
    const filterQueries: GroupedFilterQueries = {};
    for (const query of this.parsedQueriesList) {
      if (query.type !== QueryTypes.FILTER) continue;
      if (!filterQueries[query.key]) {
        filterQueries[query.key] = [{ value: query.value, operator: query.operator }];
      } else {
        filterQueries[query.key].push({ value: query.value, operator: query.operator });
      }
    }
    return filterQueries;
  }

  getSortQueries(): GroupedSortQueries {
    const sortQueries: GroupedSortQueries = {};
    for (const query of this.parsedQueriesList) {
      if (query.type !== QueryTypes.SORT) continue;
      sortQueries[query.key] = query.value;
    }
    return sortQueries;
  }

  getAllQueries(): Queries[] {
    return this.parsedQueriesList;
  }
}
